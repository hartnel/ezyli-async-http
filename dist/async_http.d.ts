import { AxiosResponse, Axios, AxiosRequestConfig } from "axios";
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
declare class AsyncRequestConfig {
    shouldNotifyFn: (data: any) => boolean;
    callBackFn: (data: any) => Promise<AxiosResponse>;
    checkIsVerboseFn: (data: any) => boolean;
    onVerboseCallback: (data: any) => void;
    onTimeoutCallback: () => Promise<AxiosResponse>;
    requestId: string;
    waitTimeoutMillis: number;
    constructor({ shouldNotifyFn, callBackFn, checkIsVerboseFn, onVerboseCallback, onTimeoutCallback, requestId, waitTimeoutMillis, }: AsyncRequestConfig);
}
declare class AsyncRequestArgs {
    waitAsyncResultTimeoutMillis?: number;
    maxRetryForRetrieveSolution?: number;
    submitRequestTimeoutMillis?: number;
    retrieveSolutionTimeoutMillis?: number;
    retryRetriveSolutionIntervalMillis?: number;
    appName?: string;
    wsResponse?: boolean;
    wsHeaders?: boolean;
    onVerboseCallback?: (data: any) => void;
    constructor({ waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution, submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis, appName, wsResponse, wsHeaders, onVerboseCallback, }: DefaultAsyncRequestArgs);
}
declare class AsyncRequestRepository {
    private static instance;
    private defaultOptions;
    private _httpClient?;
    private constructor();
    setDefaults(options: AsyncRequestArgs): void;
    setCurrentHttpClient(httpClient: Axios): void;
    private waitWsResult;
    makeSyncRequest(config: AxiosRequestConfig): Promise<AxiosResponse>;
    get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    post(url: string, config?: AxiosRequestConfig, data?: any): Promise<AxiosResponse>;
    put(url: string, config?: AxiosRequestConfig, data?: any): Promise<AxiosResponse>;
    delete(url?: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    patch(url?: string, config?: AxiosRequestConfig, data?: any): Promise<AxiosResponse>;
    head(url?: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    options(url?: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    static create(httpClient: Axios): AsyncRequestRepository;
    static getInstance(): AsyncRequestRepository;
    private _retrieveResponse;
    makeAsyncRequest(syncConfig?: AxiosRequestConfig, asyncConfig?: AsyncRequestArgs): Promise<AxiosResponse>;
    aGet(url: string, asyncConfig?: AsyncRequestArgs, syncConfig?: AxiosRequestConfig): Promise<AxiosResponse>;
    aPost(url: string, asyncConfig?: AsyncRequestArgs, syncConfig?: AxiosRequestConfig, data?: any): Promise<AxiosResponse>;
    aPut(url: string, asyncConfig?: AsyncRequestArgs, syncConfig?: AxiosRequestConfig, data?: any): Promise<AxiosResponse>;
    aDelete(url: string, asyncConfig?: AsyncRequestArgs, syncConfig?: AxiosRequestConfig): Promise<AxiosResponse>;
    aPatch(url: string, asyncConfig?: AsyncRequestArgs, syncConfig?: AxiosRequestConfig, data?: any): Promise<AxiosResponse>;
}
export { AsyncRequestRepository, AsyncRequestConfig, AsyncRequestArgs };
//# sourceMappingURL=async_http.d.ts.map