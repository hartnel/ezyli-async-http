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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosResponseFromStatusCode = exports.axiosTimeoutError = exports.RequestMethods = void 0;
exports.promiseAny = promiseAny;
var axios_1 = require("axios");
var aggregate_error_1 = __importDefault(require("aggregate-error"));
var RequestMethods;
(function (RequestMethods) {
    RequestMethods["GET"] = "GET";
    RequestMethods["POST"] = "POST";
    RequestMethods["PUT"] = "PUT";
    RequestMethods["DELETE"] = "DELETE";
    RequestMethods["PATCH"] = "PATCH";
    RequestMethods["HEAD"] = "HEAD";
    RequestMethods["OPTIONS"] = "OPTIONS";
})(RequestMethods || (exports.RequestMethods = RequestMethods = {}));
//fake axios responses
function promiseAny(promises) {
    return new Promise(function (resolve, reject) {
        var errors = [];
        var resolved = false;
        promises.forEach(function (promise, index) {
            promise
                .then(function (value) {
                if (!resolved) {
                    resolved = true;
                    resolve(value);
                }
            })
                .catch(function (error) {
                errors[index] = error;
                if (errors.length === promises.length && !resolved) {
                    reject(new aggregate_error_1.default(errors));
                }
            });
        });
    });
}
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
exports.axiosResponseFromStatusCode = axiosResponseFromStatusCode;
