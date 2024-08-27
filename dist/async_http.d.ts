import { AxiosResponse, AxiosError, Axios, AxiosRequestConfig } from "axios";
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
    private waitAsyncResultTimeoutMillis?;
    private maxRetryForRetrieveSolution?;
    private submitRequestTimeoutMillis?;
    private retrieveSolutionTimeoutMillis?;
    private retryRetriveSolutionIntervalMillis?;
    private appName?;
    constructor({ waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution, submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis, appName, }: DefaultAsyncRequestArgs);
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
    private _retrieveResponse;
}
export { AsyncRequestRepository };
//# sourceMappingURL=async_http.d.ts.map