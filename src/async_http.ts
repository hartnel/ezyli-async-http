
import axios, { AxiosResponse } from "axios"
import {WebsocketHandler , WebSocketSubscription} from "ezyli-ws";
import { RequestMethods } from "./utils";

class AsyncResponse {

    public statusCode: number;
    public data: any;
    public rawResponse?: AxiosResponse;

    constructor({statusCode, data, rawResponse}: AsyncResponse) {
        this.statusCode = statusCode;
        this.data = data;
        this.rawResponse = rawResponse;
    }

}


interface IAsyncRequestArgs {
    method: RequestMethods,
    url: string,
    wsResponse: boolean,
    wsHeaders: boolean,
    body?: any,
    headers?: any,
    queryParameters?: any,
    onVerboseCallback?: (data: any) => void,
    waitAsyncResultTimeoutMillis?: number,
    maxRetryForRetrieveSolution?: number,
    submitRequestTimeoutMillis?: number,
    retrieveSolutionTimeoutMillis?: number,
    appName?: string,
}

interface DefaultAsyncRequestArgs  {
    waitAsyncResultTimeoutMillis?: number,
    maxRetryForRetrieveSolution?: number,
    submitRequestTimeoutMillis?: number,
    retrieveSolutionTimeoutMillis?: number,
    retryRetriveSolutionIntervalMillis?: number,
    appName?: string,
}

class AsyncRequestConfig {

    public shouldNotifyFn: (data: any) => boolean;
    public callBackFn: (data: any) => any;
    public checkIsVerboseFn: (data: any) => boolean;
    public onVerboseCallback: (data: any) => void;
    public onTimeoutCallback: () => any;
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

    //check before make requests
    //insure that appName is set
    private checkBeforeRequest(options: IAsyncRequestArgs) {
        if (!options.appName) {
            throw new Error("appName is required");
        }
    }

    //wait ws result function (a promise)

    private async waitWsResult(config: AsyncRequestConfig) {

        //start a websocket handler
        let _websocketHandler = new WebsocketHandler();

        //create a promise and complete it in the websocket subscription
        let waitResultPromiseIsResolved=false;
        let waitResultPromise:Promise<any> = new Promise((resolve, reject) => {
            let sub :WebSocketSubscription = new WebSocketSubscription(
                {
                    id:config.requestId,
                    shouldNotify:(data:any) => config.shouldNotifyFn(data),
                    callback:(data:any) => {
                        let isVerboseEvent = config.checkIsVerboseFn(data) ?? false
                        
                        if(isVerboseEvent){
                            //call the callback
                            config.callBackFn(data);
                        }
                        else{
                            //finish
                            _websocketHandler.cancelSubscriptionById(config.requestId);
    
                            // call the callback passed in config
                            let res = config.callBackFn(data);

                            //resolve the promise
                            resolve(res);
                        }
                    }
                }
            );

            _websocketHandler.subscribe(sub);
        });

        let timeoutPromise = new Promise((resolve, reject) => {

            //start a setTimeout
            setTimeout(() => {
                //check if the waitPromise is not completed then cancel it
                if(!waitResultPromiseIsResolved){
                    //stop the subscription
                    _websocketHandler.cancelSubscriptionById(config.requestId);
                    
                    //call on timeout callback
                    config.onTimeoutCallback();
                }


            }, config.waitTimeoutMillis);


        });

        




    }


    


}