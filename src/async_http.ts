import axios, {
  AxiosResponse,
  AxiosError,
  Axios,
  AxiosRequestConfig,
  AxiosInstance,
} from "axios";
import { WebsocketHandler, WebSocketSubscription } from "ezyli-ws";
import { axiosResponseFromStatusCode, promiseAny, RequestMethods } from "./utils";


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
  public callBackFn: (data: any) => Promise<AxiosResponse>;
  public checkIsVerboseFn: (data: any) => boolean;
  public onVerboseCallback: (data: any) => void;
  public onTimeoutCallback: () => Promise<AxiosResponse>;
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
      wsHeaders:true,
      wsResponse:true,
    });

    return AsyncRequestRepository.instance;
  }

  //the setDefault methods
  setDefaults(options: AsyncRequestArgs) {
    // this.defaultOptions = options;
    //set the default options
    this.defaultOptions = new AsyncRequestArgs({
      waitAsyncResultTimeoutMillis: options.waitAsyncResultTimeoutMillis ?? this.defaultOptions.waitAsyncResultTimeoutMillis,
      maxRetryForRetrieveSolution: options.maxRetryForRetrieveSolution ?? this.defaultOptions.maxRetryForRetrieveSolution,
      submitRequestTimeoutMillis: options.submitRequestTimeoutMillis ?? this.defaultOptions.submitRequestTimeoutMillis,
      retrieveSolutionTimeoutMillis: options.retrieveSolutionTimeoutMillis ?? this.defaultOptions.retrieveSolutionTimeoutMillis,
      retryRetriveSolutionIntervalMillis: options.retryRetriveSolutionIntervalMillis ?? this.defaultOptions.retryRetriveSolutionIntervalMillis,
      appName: options.appName ?? this.defaultOptions.appName,
      wsResponse: options.wsResponse ?? this.defaultOptions.wsResponse,
      wsHeaders: options.wsHeaders ?? this.defaultOptions.wsHeaders,
      onVerboseCallback: options.onVerboseCallback ?? this.defaultOptions.onVerboseCallback,
  });
  }

  setCurrentHttpClient(httpClient: Axios) {
    this._httpClient = httpClient;
  }

  //wait ws result function (a promise)

  private async waitWsResult(config: AsyncRequestConfig): Promise<AxiosResponse> {
    //start a websocket handler
    let _websocketHandler = new WebsocketHandler();

    //create a promise and complete it in the websocket subscription
    let waitResultPromiseIsResolved = false;
    let waitResultPromise: Promise<AxiosResponse> = new Promise(
      (resolve, reject) => {
        let sub: WebSocketSubscription = new WebSocketSubscription({
          id: config.requestId,
          shouldNotify: (data: any) => config.shouldNotifyFn(data),
          callback: async (data: any) => {
            let isVerboseEvent = config.checkIsVerboseFn(data) ?? false;

            if (isVerboseEvent) {
              //call the callback
              config.onVerboseCallback(data);
            } else {
              //finish
              _websocketHandler.cancelSubscriptionById(config.requestId);

              //resolve or reject the promise
              
              config.callBackFn(data).then(res => resolve(res)).catch(err => {
                console.log("************************************************[waitWsResult] error in callBackFn", err.message);
                reject(err);
              }).finally(() => {
                waitResultPromiseIsResolved = true;
              });
              
            }
          },
        });

        _websocketHandler.subscribe(sub);
      }
    );

    let timeoutPromise: Promise<AxiosResponse> = new Promise((resolveOfTimeout, rejectOfTimeout) => {
      //start a setTimeout
      setTimeout(async () => {
        //check if the waitPromise is not completed then cancel it
        if (!waitResultPromiseIsResolved) {
          console.log("[Async Request] the ws is not too fast. let execute my own timeout callback" , config.waitTimeoutMillis);
          //stop the subscription
          _websocketHandler.cancelSubscriptionById(config.requestId);

          //call on timeout callback
          config.onTimeoutCallback().then(res => resolveOfTimeout(res)).catch(err => rejectOfTimeout(err));

        }
      }, config.waitTimeoutMillis);
    });

    //future any
    let promises = [waitResultPromise, timeoutPromise];

    //wait for the first promise
    return promiseAny(promises);
    //let result = await promiseAny(promises); //Promise.reject(); //await Promise.any(promises);
    //console.log("*******************************************[all] result", result);

    //return result;
  }

  public async makeSyncRequest(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    //this method is just to make a sync request

    //just fire an axios request
    let response = await this._httpClient!.request({
      ...config,
    });
    return response;
  }

  // async get 
  public async get(url:string, config?:AxiosRequestConfig) : Promise<AxiosResponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.GET,
      ...config
    });
  }

  // async post
  public async post(url:string, config?:AxiosRequestConfig, data?:any) : Promise<AxiosResponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.POST,
      ...config,
      data

    });
  }

  // async put
  public async put(url:string, config?:AxiosRequestConfig, data?:any) : Promise<AxiosResponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.PUT,
      ...config,
      data,
      
    });
  }

  // async delete
  public async delete(url?:string, config?:AxiosRequestConfig) : Promise<AxiosResponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.DELETE,
      ...config,
    });
  }

  //  async patch
  public async patch(url?:string, config?:AxiosRequestConfig, data?:any) : Promise<AxiosResponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.PATCH,
      ...config,
      data
    });
  }

  //  async head
  public async head(url?:string, config?:AxiosRequestConfig) : Promise<AxiosResponse> {
    return await this.makeSyncRequest({
      url: url,
      method: RequestMethods.HEAD,
      ...config
    });
  }

  //  async options
  public async options(url?:string, config?:AxiosRequestConfig) : Promise<AxiosResponse> {
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

  //get the instance
  public static getInstance(): AsyncRequestRepository {
    return this.instance;
  }
 

  private async _retrieveResponse({
    routingId,
    actualRetryCount = 0,
    maxRetryForRetrieveSolution,
    retryRetriveSolutionIntervalMillis,
    retrieveSolutionTimeoutMillis,
  }: RetrieveSolutionArgs): Promise<AxiosResponse> {
    //this function will be called recursively until the response is ready
    //or the maxRetryForRetrieveSolution is reached

    //check the actualRetryCount
    if(actualRetryCount==0){
      console.log("[Async Request] trying to retrieve the response");
    }
    else{
      console.log("[Async Request] retrying to retrieve the response", actualRetryCount);
    }
    

    let url: string = "/i/retrieve-solution/";

    return await new Promise<AxiosResponse>((resolve, reject) => {
      this.makeSyncRequest({
        url: url,
        method: RequestMethods.GET,
        params: {
          id: routingId,
        },
      })
        .then((response: AxiosResponse) => {
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

          let reponseIsNotYetAvailable = !isExecutor404;

          let isApi404ErrorBecauseOfExecutorNotFinished = isApi404Error && reponseIsNotYetAvailable;

          let isCorrectError =
            isTimeoutError || isApi404ErrorBecauseOfExecutorNotFinished;

          let canRetryAgain = actualRetryCount < maxRetryForRetrieveSolution;

          let shouldRetry = isCorrectError && canRetryAgain;

          console.log("[Async Request] shouldRetry", shouldRetry , "isCorrectError : " , isCorrectError , "canRetryAgain : ", canRetryAgain);

          if (shouldRetry) {
            setTimeout(async () => {
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


  public async makeAsyncRequest(syncConfig? : AxiosRequestConfig, asyncConfig? : AsyncRequestArgs): Promise<AxiosResponse> {
    //this function will be used to make an async request

    let appName = asyncConfig?.appName ?? this.defaultOptions.appName;
    let waitAsyncResultTimeoutMillis = asyncConfig?.waitAsyncResultTimeoutMillis ?? this.defaultOptions.waitAsyncResultTimeoutMillis;
    let maxRetryForRetrieveSolution = asyncConfig?.maxRetryForRetrieveSolution ?? this.defaultOptions.maxRetryForRetrieveSolution;
    let submitRequestTimeoutMillis = asyncConfig?.submitRequestTimeoutMillis ?? this.defaultOptions.submitRequestTimeoutMillis;
    let retrieveSolutionTimeoutMillis = asyncConfig?.retrieveSolutionTimeoutMillis ?? this.defaultOptions.retrieveSolutionTimeoutMillis;
    let retryRetriveSolutionIntervalMillis = asyncConfig?.retryRetriveSolutionIntervalMillis ?? this.defaultOptions.retryRetriveSolutionIntervalMillis;
    let wsResponse = asyncConfig?.wsResponse ?? this.defaultOptions.wsResponse;
    let wsHeaders = asyncConfig?.wsHeaders ?? this.defaultOptions.wsResponse;
    //add appName to aprams
    let originalParams = syncConfig?.params ?? {};
    let params = {
      ...originalParams,
      "app": appName,
    };

    //convert wsResponse and wsHeaders to 0/1
    let strWsResponse = wsResponse ? "1" : "0";
    let strWsHeaders = wsHeaders ? "1" : "0";

    //add wsResponse and wsHeaders to params
    params["ws_response"] = strWsResponse;
    params["ws_headers"] = strWsHeaders;

    return new Promise<AxiosResponse>((resolve, reject) => {

      //make the original request
    this.makeSyncRequest({
        ...syncConfig,
        params: params,
        timeout: submitRequestTimeoutMillis,
    }).then(res => {
        let response = res as AxiosResponse;
       let data = response.data["data"];
       let routingKey = data["routing_id"];

       console.log("[Async Request] routingKey", routingKey);

       //wait for the ws response
        let waitConfig = new AsyncRequestConfig({
          requestId : routingKey,
          waitTimeoutMillis : waitAsyncResultTimeoutMillis!,
          shouldNotifyFn : (rawWsData: any) =>{
            let wsData = rawWsData["data"] ?? {};
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
          callBackFn :  (rawWsData:any)=> {
            return new Promise<AxiosResponse>((resolveOfCallBack, rejectOfCallback)=>{
              let wsData = rawWsData["data"] ?? {};
              console.log("[Async Request] wait response via websocket finished", wsData);

            //check if data has full response
            let hasResponse = wsData["has_response"];

            if(hasResponse){
              let responseContent = wsData["response"]; 
              let resJson = responseContent["json"];
              let resHeaders = responseContent["headers"];
              let statusCode = responseContent["status_code"];
              //console.log("[Async Request] data of the response is present in the response" , resJson , resHeaders, statusCode);

              //create a response object
              //console.log("***************************" ,response.request, statusCode, resJson, resHeaders )
              let fakeResponse = axiosResponseFromStatusCode(response.request, statusCode, resJson, resHeaders);
              //console.log("********************************* type", typeof fakeResponse , fakeResponse instanceof Error);

              //check if response is Axios error then reject
              if(fakeResponse instanceof Error){
                rejectOfCallback(fakeResponse);
              }
              else{
                //build fake promise and return
                resolveOfCallBack(fakeResponse);
              }
              
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
          checkIsVerboseFn : (rawWsData:any) => {
            let wsData = rawWsData["data"] ?? {};
            let wsRoutingKey = wsData["routing_id"];
            let state = wsData["state"];
            let isInProgress = state === requestProgressing;
            return routingKey === wsRoutingKey && isInProgress;
          },
          onVerboseCallback : (rawWsData:any) => {
            let wsData = rawWsData["data"] ?? {};
            console.log("[Async Request] verboseCallback: ", wsData);
            let verboseData = wsData["verbose_data"];
            //call the verbose callback
            asyncConfig?.onVerboseCallback?.(verboseData);
          },

          onTimeoutCallback : () => {
            return new Promise<AxiosResponse>((resolveOfTimeOut, rejectOfTimeOut) => {
              //console.log("[Async Request] timeoutCallback");
              console.log("[Async Request] Executing onTimeOutCallback (too long to wait for the response via ws)");
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
      .catch(err => {
        console.log("**********************************[Async Request] error in waitWsResult", err.message);
        reject(err);
      });

    })
      .catch(err => {
        
          reject(err);

      });

    });

  }

  //async get
  public async aGet(url: string, asyncConfig? : AsyncRequestArgs , syncConfig ? : AxiosRequestConfig ): Promise<AxiosResponse> {
    return await this.makeAsyncRequest({
      ...syncConfig,
      url,
      method: RequestMethods.GET,
    }, asyncConfig);
  }


  //async post
  public async aPost(url: string, asyncConfig? : AsyncRequestArgs , syncConfig ? : AxiosRequestConfig, data?:any): Promise<AxiosResponse> {
    return await this.makeAsyncRequest({
      ...syncConfig,
      url,
      method: RequestMethods.POST,
      data
    }, asyncConfig);
  }

  //async put
  public async aPut(url: string, asyncConfig? : AsyncRequestArgs , syncConfig ? : AxiosRequestConfig, data?:any): Promise<AxiosResponse> {
    return await this.makeAsyncRequest({
      ...syncConfig,
      url,
      method: RequestMethods.PUT,
      data
    }, asyncConfig);
  }

  //async delete
  public async aDelete(url: string, asyncConfig? : AsyncRequestArgs , syncConfig ? : AxiosRequestConfig): Promise<AxiosResponse> {
    return await this.makeAsyncRequest({
      ...syncConfig,
      url,
      method: RequestMethods.DELETE,
    }, asyncConfig);
  }

  //async patch
  public async aPatch(url: string, asyncConfig? : AsyncRequestArgs , syncConfig ? : AxiosRequestConfig, data?:any): Promise<AxiosResponse> {
    return await this.makeAsyncRequest({
      ...syncConfig,
      url,
      method: RequestMethods.PATCH,
      data
    }, asyncConfig);
  }





  
}

export { AsyncRequestRepository, AsyncRequestConfig, AsyncRequestArgs };
