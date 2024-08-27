import { AxiosError, AxiosResponse } from "axios";
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
declare const axiosResponseFromStatusCode: (request: any, statusCode: number, data: any, headers: any) => AxiosResponse | AxiosError;
export { RequestMethods, axiosTimeoutError, promiseAny, axiosResponseFromStatusCode };
//# sourceMappingURL=utils.d.ts.map