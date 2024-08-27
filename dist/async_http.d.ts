import { AxiosResponse, AxiosError, Axios, AxiosRequestConfig } from "axios";
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
}
type ApiReponse = AxiosResponse | AxiosError | Error;
declare class AsyncRequestArgs {
    waitAsyncResultTimeoutMillis?: number;
    maxRetryForRetrieveSolution?: number;
    submitRequestTimeoutMillis?: number;
    retrieveSolutionTimeoutMillis?: number;
    retryRetriveSolutionIntervalMillis?: number;
    appName?: string;
    constructor({ waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution, submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis, appName }: DefaultAsyncRequestArgs);
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
    makeAsyncRequest(config: IAsyncRequestArgs): Promise<void>;
    private _retrieveResponse;
}
export { AsyncRequestRepository };
//# sourceMappingURL=async_http.d.ts.map