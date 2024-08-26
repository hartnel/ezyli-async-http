
import axios, { AxiosResponse, AxiosError, Axios, AxiosRequestConfig } from "axios"
import {WebsocketHandler , WebSocketSubscription} from "ezyli-ws";
import { RequestMethods } from "./utils";


interface IAsyncRequestArgs {
    wsResponse: boolean,
    wsHeaders: boolean,
    onVerboseCallback?: (data: any) => void,
    waitAsyncResultTimeoutMillis?: number,
    maxRetryForRetrieveSolution?: number,
    submitRequestTimeoutMillis?: number,
    retrieveSolutionTimeoutMillis?: number,
    appName?: string,
    syncConfig? :AxiosRequestConfig,
}

interface DefaultAsyncRequestArgs  {
    waitAsyncResultTimeoutMillis?: number,
    maxRetryForRetrieveSolution?: number,
    submitRequestTimeoutMillis?: number,
    retrieveSolutionTimeoutMillis?: number,
    retryRetriveSolutionIntervalMillis?: number,
    appName?: string,
}

interface RetrieveSolutionArgs {
    routingId: string,
    actualRetryCount: number,
    maxRetryForRetrieveSolution: number,
    retryRetriveSolutionIntervalMillis: number,
    retrieveSolutionTimeoutMillis : number,
}

type ApiReponse = AxiosResponse|AxiosError|Error;

class AsyncRequestConfig {

    public shouldNotifyFn: (data: any) => boolean;
    public callBackFn: (data: any) => Promise<ApiReponse>;
    public checkIsVerboseFn: (data: any) => boolean;
    public onVerboseCallback: (data: any) => void;
    public onTimeoutCallback: () => Promise<AxiosError>;
    public requestId: string;
    public waitTimeoutMillis: number;

    constructor({shouldNotifyFn, callBackFn, checkIsVerboseFn, onVerboseCallback, onTimeoutCallback, requestId , waitTimeoutMillis} : AsyncRequestConfig) {
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

    private waitAsyncResultTimeoutMillis? : number;
    private maxRetryForRetrieveSolution? : number;
    private submitRequestTimeoutMillis? : number;
    private retrieveSolutionTimeoutMillis? : number;
    private retryRetriveSolutionIntervalMillis? : number;
    private appName? : string;


    constructor({waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution, submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis, appName} : DefaultAsyncRequestArgs) {
        this.waitAsyncResultTimeoutMillis = waitAsyncResultTimeoutMillis;
        this.maxRetryForRetrieveSolution = maxRetryForRetrieveSolution;
        this.submitRequestTimeoutMillis = submitRequestTimeoutMillis;
        this.retrieveSolutionTimeoutMillis = retrieveSolutionTimeoutMillis;
        this.retryRetriveSolutionIntervalMillis = retryRetriveSolutionIntervalMillis;
        this.appName = appName;
    }
}

class AsyncRequestRepository {
    
    private static instance: AsyncRequestRepository;
    private defaultOptions: AsyncRequestArgs;
    private _httpClient ?:Axios;
    

    private constructor() {
        if(!AsyncRequestRepository.instance) {
            AsyncRequestRepository.instance = this;
        }
        this.defaultOptions = new AsyncRequestArgs({
            waitAsyncResultTimeoutMillis : 5*1000*60, // 5 minutes
            maxRetryForRetrieveSolution : 15, // 5 times
            submitRequestTimeoutMillis : 5*1000*60, // 5 minutes
            retrieveSolutionTimeoutMillis : 5*1000*60, // 5 minutes
            retryRetriveSolutionIntervalMillis : 5*1000, // 5 seconds
        });

        return AsyncRequestRepository.instance;
    }

    //the setDefault methods
    setDefaults(options:AsyncRequestArgs){
        this.defaultOptions = options;
    }

    setCurrentHttpClient(httpClient:Axios){
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

    private async waitWsResult(config: AsyncRequestConfig):Promise<ApiReponse> {

        //start a websocket handler
        let _websocketHandler = new WebsocketHandler();

        //create a promise and complete it in the websocket subscription
        let waitResultPromiseIsResolved=false;
        let waitResultPromise:Promise<ApiReponse> = new Promise((resolve, reject) => {
            let sub :WebSocketSubscription = new WebSocketSubscription(
                {
                    id:config.requestId,
                    shouldNotify:(data:any) => config.shouldNotifyFn(data),
                    callback: async(data:any) => {
                        let isVerboseEvent = config.checkIsVerboseFn(data) ?? false
                        
                        if(isVerboseEvent){
                            //call the callback
                            config.callBackFn(data);
                        }
                        else{
                            //finish
                            _websocketHandler.cancelSubscriptionById(config.requestId);
    
                            // call the callback passed in config
                            let res = await config.callBackFn(data);
                            //resolve the promise
                            resolve(res);
                        }
                    }
                }
            );

            _websocketHandler.subscribe(sub);
        });

        let timeoutPromise:Promise<ApiReponse> = new Promise((resolve, reject) => {

            //start a setTimeout
            setTimeout(async () =>{
                //check if the waitPromise is not completed then cancel it
                if(!waitResultPromiseIsResolved){
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
        let promises = [
            waitResultPromise,
            timeoutPromise
        ];

        //wait for the first promise
        let result = await Promise.any(promises);

        return result;

    }

    public async makeSyncRequest(config: AxiosRequestConfig) : Promise<ApiReponse> {
        //this method is just to make a sync request

        //just fire an axios request
        let response = await axios({
            ...config
        });
        return response;
    };


    private async _retrieveResponse({routingId, actualRetryCount=0, maxRetryForRetrieveSolution, retryRetriveSolutionIntervalMillis, retrieveSolutionTimeoutMillis}:RetrieveSolutionArgs):Promise<ApiReponse> {
        //this function will be called recursively until the response is ready
        //or the maxRetryForRetrieveSolution is reached

        //check the actualRetryCount

        let url:string = "/i/retrieve-solution/";

        return await new Promise<ApiReponse> ((resolve, reject) => {

            this.makeSyncRequest({
                url:url,
                method:RequestMethods.GET,
                params:{
                    "id":routingId
                }
            }).then((response: ApiReponse) => {
                resolve(response);
            }).catch((error:AxiosError) => {
                // some check before return the error
                //check if it's internetConnexion error or timeout ...
                let isTimeoutError = error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND';
                let isApi404Error = error.response?.status === 404;
                let body = error.response?.data as any;
                let isExecutor404 = body?.["IS_EXECUTOR_404"] === true;

                let reponseIsNotAvailable = !isExecutor404;

                let isCorrectError = isTimeoutError || isApi404Error || reponseIsNotAvailable;

                let canRetryAgain = actualRetryCount < maxRetryForRetrieveSolution;

                let shouldRetry = isCorrectError && canRetryAgain;

                if(shouldRetry){
                    setTimeout(
                        async () => {
                            console.log("retrying to retrieve the response");
                            return await this._retrieveResponse(
                                {
                                    routingId,
                                    actualRetryCount: actualRetryCount+1,
                                    maxRetryForRetrieveSolution,
                                    retryRetriveSolutionIntervalMillis,
                                    retrieveSolutionTimeoutMillis
                                }
                            );
                        },
                        retryRetriveSolutionIntervalMillis
                    );
                }
                else{
                    //return the error
                    resolve(error);
                }
            });

        });
    }


}