import { AxiosResponse, AxiosError, Axios, AxiosRequestConfig } from "axios";
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
type ApiReponse = AxiosResponse | AxiosError | Error;
declare class AsyncRequestConfig {
    shouldNotifyFn: (data: any) => boolean;
    callBackFn: (data: any) => Promise<ApiReponse>;
    checkIsVerboseFn: (data: any) => boolean;
    onVerboseCallback: (data: any) => void;
    onTimeoutCallback: () => Promise<AxiosError>;
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
    constructor({ waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution, submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis, appName, wsResponse, wsHeaders, }: DefaultAsyncRequestArgs);
}
declare class AsyncRequestRepository {
    private static instance;
    private defaultOptions;
    private _httpClient?;
    private constructor();
    setDefaults(options: AsyncRequestArgs): void;
    setCurrentHttpClient(httpClient: Axios): void;
    private checkBeforeRequest;
    private waitWsResult;
    makeSyncRequest(config: AxiosRequestConfig): Promise<ApiReponse>;
    get(url: string, config: AxiosRequestConfig): Promise<ApiReponse>;
    post(url: string, config: AxiosRequestConfig, data: any): Promise<ApiReponse>;
    put(url: string, config: AxiosRequestConfig, data: any): Promise<ApiReponse>;
    delete(url: string, config: AxiosRequestConfig): Promise<ApiReponse>;
    patch(url: string, config: AxiosRequestConfig, data: any): Promise<ApiReponse>;
    head(url: string, config: AxiosRequestConfig): Promise<ApiReponse>;
    options(url: string, config: AxiosRequestConfig): Promise<ApiReponse>;
    static create(httpClient: Axios): AsyncRequestRepository;
    private _retrieveResponse;
}
export { AsyncRequestRepository, AsyncRequestConfig, AsyncRequestArgs };
//# sourceMappingURL=async_http.d.ts.map