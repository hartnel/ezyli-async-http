import axios, {
  AxiosResponse,
  AxiosError,
  Axios,
  AxiosRequestConfig,
  AxiosInstance,
} from "axios";
import { WebsocketHandler, WebSocketSubscription } from "ezyli-ws";
import { promiseAny, RequestMethods } from "./utils";


const  requestFinished = "completed";
const requestProgressing = "progressing";

interface IAsyncRequestArgs {
  wsResponse: boolean;
  wsHeaders: boolean;
  onVerboseCallback?: (data: any) => void;
  waitAsyncResultTimeoutMillis?: number;
  maxRetryForRetrieveSolution?: number;
  submitRequestTimeoutMillis?: number;
  retrieveSolutionTimeoutMillis?: number;
  appName?: string;
  syncConfig?: AxiosRequestConfig;
}

interface DefaultAsyncRequestArgs {
  waitAsyncResultTimeoutMillis?: number;
  maxRetryForRetrieveSolution?: number;
  submitRequestTimeoutMillis?: number;
  retrieveSolutionTimeoutMillis?: number;
  retryRetriveSolutionIntervalMillis?: number;
  appName?: string;
  wsResponse?: boolean;
  wsHeaders?: boolean;
}

interface RetrieveSolutionArgs {
  routingId: string;
  actualRetryCount: number;
  maxRetryForRetrieveSolution: number;
  retryRetriveSolutionIntervalMillis: number;
  retrieveSolutionTimeoutMillis: number;
}

type ApiReponse = AxiosResponse | AxiosError | Error;

class AsyncRequestConfig {
  public shouldNotifyFn: (data: any) => boolean;
  public callBackFn: (data: any) => Promise<ApiReponse>;
  public checkIsVerboseFn: (data: any) => boolean;
  public onVerboseCallback: (data: any) => void;
  public onTimeoutCallback: () => Promise<AxiosError>;
  public requestId: string;
  public waitTimeoutMillis: number;

  constructor({
    shouldNotifyFn,
    callBackFn,
    checkIsVerboseFn,
    onVerboseCallback,
    onTimeoutCallback,
    requestId,
    waitTimeoutMillis,
  }: AsyncRequestConfig) {
    this.shouldNotifyFn = shouldNotifyFn;
    this.callBackFn = callBackFn;
    this.checkIsVerboseFn = checkIsVerboseFn;
    this.onVerboseCallback = onVerboseCallback;
    this.onTimeoutCallback = onTimeoutCallback;
    this.requestId = requestId;
    this.waitTimeoutMillis = waitTimeoutMillis;
  }
}

class AsyncRequestArgs {
  public waitAsyncResultTimeoutMillis?: number;
  public maxRetryForRetrieveSolution?: number;
  public submitRequestTimeoutMillis?: number;
  public retrieveSolutionTimeoutMillis?: number;
  public retryRetriveSolutionIntervalMillis?: number;
  public appName?: string;
  public wsResponse?: boolean;
  public wsHeaders?: boolean;

  constructor({
    waitAsyncResultTimeoutMillis,
    maxRetryForRetrieveSolution,
    submitRequestTimeoutMillis,
    retrieveSolutionTimeoutMillis,
    retryRetriveSolutionIntervalMillis,
    appName,
    wsResponse,
    wsHeaders,

  }: DefaultAsyncRequestArgs) {
    this.waitAsyncResultTimeoutMillis = waitAsyncResultTimeoutMillis;
    this.maxRetryForRetrieveSolution = maxRetryForRetrieveSolution;
    this.submitRequestTimeoutMillis = submitRequestTimeoutMillis;
    this.retrieveSolutionTimeoutMillis = retrieveSolutionTimeoutMillis;
    this.retryRetriveSolutionIntervalMillis =
      retryRetriveSolutionIntervalMillis;
    this.appName = appName;
    this.wsResponse = wsResponse;
    this.wsHeaders = wsHeaders;
  }
}

class AsyncRequestRepository {
  private static instance: AsyncRequestRepository;
  private defaultOptions: AsyncRequestArgs;
  private _httpClient?: Axios;

  private constructor() {
    if (!AsyncRequestRepository.instance) {
      AsyncRequestRepository.instance = this;
    }
    this.defaultOptions = new AsyncRequestArgs({
      waitAsyncResultTimeoutMillis: 5 * 1000 * 60, // 5 minutes
      maxRetryForRetrieveSolution: 15, // 5 times
      submitRequestTimeoutMillis: 5 * 1000 * 60, // 5 minutes
      retrieveSolutionTimeoutMillis: 5 * 1000 * 60, // 5 minutes
      retryRetriveSolutionIntervalMillis: 5 * 1000, // 5 seconds
    });

    return AsyncRequestRepository.instance;
  }

  //the setDefault methods
  setDefaults(options: AsyncRequestArgs) {
    this.defaultOptions = options;
  }

  setCurrentHttpClient(httpClient: Axios) {
    this._httpClient = httpClient;
  }

  //check before make requests
  //insure that appName is set
  private checkBeforeRequest(options: IAsyncRequestArgs) {
    if (!options.appName) {
      throw new Error("appName is required");
    }
  }

  //wait ws result function (a promise)

  private async waitWsResult(config: AsyncRequestConfig): Promise<ApiReponse> {
    //start a websocket handler
    let _websocketHandler = new WebsocketHandler();

    //create a promise and complete it in the websocket subscription
    let waitResultPromiseIsResolved = false;
    let waitResultPromise: Promise<ApiReponse> = new Promise(
      (resolve, reject) => {
        let sub: WebSocketSubscription = new WebSocketSubscription({
          id: config.requestId,
          shouldNotify: (data: any) => config.shouldNotifyFn(data),
          callback: async (data: any) => {
            let isVerboseEvent = config.checkIsVerboseFn(data) ?? false;

            if (isVerboseEvent) {
              //call the callback
              config.callBackFn(data);
            } else {
              //finish
              _websocketHandler.cancelSubscriptionById(config.requestId);

              // call the callback passed in config
              let res = await config.callBackFn(data);
              //resolve the promise
              resolve(res);
            }
          },
        });

        _websocketHandler.subscribe(sub);
      }
    );

    let timeoutPromise: Promise<ApiReponse> = new Promise((resolve, reject) => {
      //start a setTimeout
      setTimeout(async () => {
        //check if the waitPromise is not completed then cancel it
        if (!waitResultPromiseIsResolved) {
          //stop the subscription
          _websocketHandler.cancelSubscriptionById(config.requestId);

          //call on timeout callback
          let res = await config.onTimeoutCallback();

          //resolve the promise
          resolve(res);
        }
      }, config.waitTimeoutMillis);
    });

    //future any
    let promises = [waitResultPromise, timeoutPromise];

    //wait for the first promise
    let result = await  promiseAny(promises); //Promise.reject(); //await Promise.any(promises);

    return result;
  }

  public async makeSyncRequest(
    config: AxiosRequestConfig
  ): Promise<ApiReponse> {
    //this method is just to make a sync request

    //just fire an axios request
    let response = await this._httpClient?.request({
      ...config,
    }) as ApiReponse;
    return response;
  }

  // async get 
  public async get(url:string, config:AxiosRequestConfig) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.GET,
      ...config
    });
  }

  // async post
  public async post(url:string, config:AxiosRequestConfig, data:any) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.POST,
      ...config,
      data

    });
  }

  // async put
  public async put(url:string, config:AxiosRequestConfig, data:any) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.PUT,
      ...config,
      data,
      
    });
  }

  // async delete
  public async delete(url:string, config:AxiosRequestConfig) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.DELETE,
      ...config,
    });
  }

  //  async patch
  public async patch(url:string, config:AxiosRequestConfig, data:any) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.PATCH,
      ...config,
      data
    });
  }

  //  async head
  public async head(url:string, config:AxiosRequestConfig) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.HEAD,
      ...config
    });
  }

  //  async options
  public async options(url:string, config:AxiosRequestConfig) : Promise<ApiReponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.OPTIONS,
      ...config
    });
  }


  //  static create with http client 
  public static create(httpClient: Axios): AsyncRequestRepository {
    let asyncRequest = new AsyncRequestRepository();
    asyncRequest.setCurrentHttpClient(httpClient);
    return asyncRequest;
  }
 

  private async _retrieveResponse({
    routingId,
    actualRetryCount = 0,
    maxRetryForRetrieveSolution,
    retryRetriveSolutionIntervalMillis,
    retrieveSolutionTimeoutMillis,
  }: RetrieveSolutionArgs): Promise<ApiReponse> {
    //this function will be called recursively until the response is ready
    //or the maxRetryForRetrieveSolution is reached

    //check the actualRetryCount

    let url: string = "/i/retrieve-solution/";

    return await new Promise<ApiReponse>((resolve, reject) => {
      this.makeSyncRequest({
        url: url,
        method: RequestMethods.GET,
        params: {
          id: routingId,
        },
      })
        .then((response: ApiReponse) => {
          resolve(response);
        })
        .catch((error: AxiosError) => {
          // some check before return the error
          //check if it's internetConnexion error or timeout ...
          let isTimeoutError =
            error.code === "ECONNABORTED" || error.code === "ENOTFOUND";
          let isApi404Error = error.response?.status === 404;
          let body = error.response?.data as any;
          let isExecutor404 = body?.["IS_EXECUTOR_404"] === true;

          let reponseIsNotAvailable = !isExecutor404;

          let isCorrectError =
            isTimeoutError || isApi404Error || reponseIsNotAvailable;

          let canRetryAgain = actualRetryCount < maxRetryForRetrieveSolution;

          let shouldRetry = isCorrectError && canRetryAgain;

          if (shouldRetry) {
            setTimeout(async () => {
              console.log("retrying to retrieve the response");
              return await this._retrieveResponse({
                routingId,
                actualRetryCount: actualRetryCount + 1,
                maxRetryForRetrieveSolution,
                retryRetriveSolutionIntervalMillis,
                retrieveSolutionTimeoutMillis,
              });
            }, retryRetriveSolutionIntervalMillis);
          } else {
            //return the error
            reject(error);
          }
        });
    });
  }


  // public async makeAsyncRequest(syncConfig : AxiosRequestConfig, asyncConfig : AsyncRequestArgs): Promise<ApiReponse> {
  //   //this function will be used to make an async request

  //   let appName = asyncConfig.appName ?? this.defaultOptions.appName;
  //   let waitAsyncResultTimeoutMillis = asyncConfig.waitAsyncResultTimeoutMillis ?? this.defaultOptions.waitAsyncResultTimeoutMillis;
  //   let maxRetryForRetrieveSolution = asyncConfig.maxRetryForRetrieveSolution ?? this.defaultOptions.maxRetryForRetrieveSolution;
  //   let submitRequestTimeoutMillis = asyncConfig.submitRequestTimeoutMillis ?? this.defaultOptions.submitRequestTimeoutMillis;
  //   let retrieveSolutionTimeoutMillis = asyncConfig.retrieveSolutionTimeoutMillis ?? this.defaultOptions.retrieveSolutionTimeoutMillis;
  //   let retryRetriveSolutionIntervalMillis = asyncConfig.retryRetriveSolutionIntervalMillis ?? this.defaultOptions.retryRetriveSolutionIntervalMillis;
    
  //   //add appName to aprams
  //   let originalParams = syncConfig.params ?? {};
  //   let params = {
  //     ...originalParams,
  //     "app": appName,
  //   };

  //   //convert wsResponse and wsHeaders to 0/1
  //   let wsResponse = asyncConfig.wsResponse ? "1" : "0";
  //   let wsHeaders = asyncConfig.wsHeaders ? "1" : "0";

  //   //add wsResponse and wsHeaders to params
  //   params["ws_response"] = wsResponse;
  //   params["ws_headers"] = wsHeaders;

  //   return new Promise<ApiReponse>((resolve, reject) => {

  //     //make the original request
  //   this.makeSyncRequest({
  //       ...syncConfig,
  //       params: params,
  //       timeout: submitRequestTimeoutMillis,
  //   }).then(res => {
  //       let response = res as AxiosResponse;
  //      let data = response.data["data"];
  //      let routingKey = data["routing_id"];

  //      //wait for the ws response
  //       let waitConfig = new AsyncRequestConfig({
  //         requestId : routingKey,
  //         shouldNotifyFn : (data: any) {
  //           let wsRoutingKey = data["routing_id"];

  //           // the state to know if it's completed
  //           let state = data["state"];

  //           let stateIsCompleted = state === requestFinished;
  //           let stateIsProgressing = state === requestProgressing;

  //           if(routingKey === wsRoutingKey){
  //             return stateIsCompleted || stateIsProgressing;
  //           }else{
  //             return false;
  //           }
  //         },
  //         callBackFn : (data:any)=> {

  //         },
  //         checkIsVerboseFn : (data:any) => {
  //           let wsRoutingKey = data["routing_id"];
  //           return routingKey === wsRoutingKey;
  //         },
  //         onVerboseCallback : (data:any) => {
  //           let wsRoutingKey = data["routing_id"];
  //           if(routingKey === wsRoutingKey){
  //             console.log(data);
  //           }
  //         },

  //         onTimeoutCallback : () => {
  //           return new Promise<AxiosError>((resolve, reject) => {
  //             reject(new Error("timeout"));
  //           });
  //         },
  //       },
        
      
  //     );



  //   })
  //     .catch(err => {
        
  //         reject(err);

  //     });


  //   });
    





  // }
}

export { AsyncRequestRepository, AsyncRequestConfig, AsyncRequestArgs };
