"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosTimeoutError = exports.RequestMethods = void 0;
var axios_1 = require("axios");
var RequestMethods;
(function (RequestMethods) {
    RequestMethods["GET"] = "GET";
    RequestMethods["POST"] = "POST";
    RequestMethods["PUT"] = "PUT";
    RequestMethods["DELETE"] = "DELETE";
})(RequestMethods || (exports.RequestMethods = RequestMethods = {}));
//fake axios responses
var axiosTimeoutError = function (request) {
    var errorObject = {
        code: 'ECONNABORTED',
        request: request,
        message: 'timeout',
        response: null,
    };
    return new axios_1.AxiosError(errorObject.message, errorObject.code, errorObject.request, errorObject.response);
};
exports.axiosTimeoutError = axiosTimeoutError;
var axiosResponseFromStatusCode = function (request, statusCode, data, headers) {
    var responseObject = {
        data: data,
        status: statusCode,
        statusText: '',
        headers: __assign({}, headers),
        request: null,
        config: __assign({}, request)
    };
    if (statusCode >= 200 && statusCode < 300) {
        return responseObject;
    }
    else {
        //  make error object using status code data and headers
        var errorOject = new axios_1.AxiosError(request.code, request.message, request);
        return errorOject;
    }
};
