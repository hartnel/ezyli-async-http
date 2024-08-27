import { AxiosError } from "axios";
var RequestMethods;
(function (RequestMethods) {
    RequestMethods["GET"] = "GET";
    RequestMethods["POST"] = "POST";
    RequestMethods["PUT"] = "PUT";
    RequestMethods["DELETE"] = "DELETE";
})(RequestMethods || (RequestMethods = {}));
//fake axios responses
const axiosTimeoutError = (request) => {
    const errorObject = {
        code: 'ECONNABORTED',
        request: request,
        message: 'timeout',
        response: null,
    };
    return new AxiosError(errorObject.message, errorObject.code, errorObject.request, errorObject.response);
};
const axiosResponseFromStatusCode = (request, statusCode, data, headers) => {
    const responseObject = {
        data: data,
        status: statusCode,
        statusText: '',
        headers: {
            ...headers
        },
        request: null,
        config: {
            ...request
        }
    };
    if (statusCode >= 200 && statusCode < 300) {
        return responseObject;
    }
    else {
        //  make error object using status code data and headers
        const errorOject = new AxiosError(request.code, request.message, request);
        return errorOject;
    }
};
//
export { RequestMethods, axiosTimeoutError };
