import axios, {
  AxiosResponse,
  AxiosError,
  Axios,
  AxiosRequestConfig,
  AxiosInstance,
} from "axios";
import { WebsocketHandler, WebSocketSubscription } from "ezyli-ws";
import { ApiReponse, axiosResponseFromStatusCode, promiseAny, RequestMethods } from "./utils";


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
  onVerboseCallback?: (data: any) => void;
}

interface RetrieveSolutionArgs {
  routingId: string;
  actualRetryCount: number;
  maxRetryForRetrieveSolution: number;
  retryRetriveSolutionIntervalMillis: number;
  retrieveSolutionTimeoutMillis: number;
}

class AsyncRequestConfig {
  public shouldNotifyFn: (data: any) => boolean;
  public callBackFn: (data: any) => Promise<ApiReponse>;
  public checkIsVerboseFn: (data: any) => boolean;
  public onVerboseCallback: (data: any) => void;
  public onTimeoutCallback: () => Promise<ApiReponse>;
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
  public onVerboseCallback?: (data: any) => void;

  constructor({
    waitAsyncResultTimeoutMillis,
    maxRetryForRetrieveSolution,
    submitRequestTimeoutMillis,
    retrieveSolutionTimeoutMillis,
    retryRetriveSolutionIntervalMillis,
    appName,
    wsResponse,
    wsHeaders,
    onVerboseCallback,

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
    this.onVerboseCallback = onVerboseCallback;
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


  public async makeAsyncRequest(syncConfig : AxiosRequestConfig, asyncConfig : AsyncRequestArgs): Promise<ApiReponse> {
    //this function will be used to make an async request

    let appName = asyncConfig.appName ?? this.defaultOptions.appName;
    let waitAsyncResultTimeoutMillis = asyncConfig.waitAsyncResultTimeoutMillis ?? this.defaultOptions.waitAsyncResultTimeoutMillis;
    let maxRetryForRetrieveSolution = asyncConfig.maxRetryForRetrieveSolution ?? this.defaultOptions.maxRetryForRetrieveSolution;
    let submitRequestTimeoutMillis = asyncConfig.submitRequestTimeoutMillis ?? this.defaultOptions.submitRequestTimeoutMillis;
    let retrieveSolutionTimeoutMillis = asyncConfig.retrieveSolutionTimeoutMillis ?? this.defaultOptions.retrieveSolutionTimeoutMillis;
    let retryRetriveSolutionIntervalMillis = asyncConfig.retryRetriveSolutionIntervalMillis ?? this.defaultOptions.retryRetriveSolutionIntervalMillis;
    
    //add appName to aprams
    let originalParams = syncConfig.params ?? {};
    let params = {
      ...originalParams,
      "app": appName,
    };

    //convert wsResponse and wsHeaders to 0/1
    let wsResponse = asyncConfig.wsResponse ? "1" : "0";
    let wsHeaders = asyncConfig.wsHeaders ? "1" : "0";

    //add wsResponse and wsHeaders to params
    params["ws_response"] = wsResponse;
    params["ws_headers"] = wsHeaders;

    return new Promise<ApiReponse>((resolve, reject) => {

      //make the original request
    this.makeSyncRequest({
        ...syncConfig,
        params: params,
        timeout: submitRequestTimeoutMillis,
    }).then(res => {
        let response = res as AxiosResponse;
       let data = response.data["data"];
       let routingKey = data["routing_id"];

       //wait for the ws response
        let waitConfig = new AsyncRequestConfig({
          requestId : routingKey,
          waitTimeoutMillis : waitAsyncResultTimeoutMillis!,
          shouldNotifyFn : (wsData: any) =>{
            let wsRoutingKey = wsData["routing_id"];

            // the state to know if it's completed
            let state = wsData["state"];

            let stateIsCompleted = state === requestFinished;
            let stateIsProgressing = state === requestProgressing;

            if(routingKey === wsRoutingKey){
              return stateIsCompleted || stateIsProgressing;
            }else{
              return false;
            }
          },
          callBackFn :  (wsData:any)=> {
            return new Promise<ApiReponse>((resolveOfCallBack, rejectOfCallback)=>{
              console.log("[Async Request] onFInished", wsData);

            //check if data has full response
            let hasResponse = wsData["has_response"];

            if(hasResponse){
              let resJson = wsData["json"];
              let resHeaders = wsData["headers"];
              let statusCode = wsData["status_code"];

              //create a response object
              let fakeResponse = axiosResponseFromStatusCode(response.request, statusCode, resJson, resHeaders);

              //build fake promise and return
              resolveOfCallBack(fakeResponse);
              
            } else{
              console.log("[Async Request] response ws but the data is not in the response");
              //retrieve the response
                this._retrieveResponse({
                routingId: routingKey,
                maxRetryForRetrieveSolution : maxRetryForRetrieveSolution!,
                actualRetryCount : 0,
                retryRetriveSolutionIntervalMillis : retryRetriveSolutionIntervalMillis!,
                retrieveSolutionTimeoutMillis : retrieveSolutionTimeoutMillis!,
              }).then(res => resolveOfCallBack(res))
              .catch(err => rejectOfCallback(err));
            }
            });

          },
          checkIsVerboseFn : (wsData:any) => {
            let wsRoutingKey = wsData["routing_id"];
            let state = wsData["state"];
            let isInProgress = state === requestProgressing;
            return routingKey === wsRoutingKey && isInProgress;
          },
          onVerboseCallback : (wsData:any) => {
            console.log("[Async Request] verboseCallback: ", wsData);
            let verboseData = wsData["verbose_data"];
            //call the verbose callback
            asyncConfig.onVerboseCallback?.(verboseData);
          },

          onTimeoutCallback : () => {
            return new Promise<ApiReponse>((resolveOfTimeOut, rejectOfTimeOut) => {
              //console.log("[Async Request] timeoutCallback");
              console.log("[Async Request] timeoutCallback");
              //retry to retrieve the response
              this._retrieveResponse({
                routingId: routingKey,
                maxRetryForRetrieveSolution : maxRetryForRetrieveSolution!,
                actualRetryCount : 0,
                retryRetriveSolutionIntervalMillis : retryRetriveSolutionIntervalMillis!,
                retrieveSolutionTimeoutMillis : retrieveSolutionTimeoutMillis!,
              }).then(res => resolveOfTimeOut(res))
              .catch(err => rejectOfTimeOut(err));
            });
          },
        },
        
      );

      //wait for the result
      this.waitWsResult(waitConfig).then(res => resolve(res))
      .catch(err => reject(err));

    })
      .catch(err => {
        
          reject(err);

      });

    });

  }
}

export { AsyncRequestRepository, AsyncRequestConfig, AsyncRequestArgs };
