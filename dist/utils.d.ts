import { AxiosError, AxiosResponse } from "axios";
type ApiReponse = AxiosResponse | AxiosError | Error;
declare enum RequestMethods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS"
}
declare function promiseAny(promises: Promise<any>[]): Promise<any>;
declare const axiosTimeoutError: (request?: any) => AxiosError;
declare const axiosResponseFromStatusCode: (request: any, statusCode: number, data: any, headers: any) => any;
export { RequestMethods, axiosTimeoutError, promiseAny, axiosResponseFromStatusCode, ApiReponse };
//# sourceMappingURL=utils.d.ts.map