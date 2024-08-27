import { AxiosError } from "axios";
declare enum RequestMethods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}
declare const axiosTimeoutError: (request?: any) => AxiosError;
export { RequestMethods, axiosTimeoutError };
//# sourceMappingURL=utils.d.ts.map