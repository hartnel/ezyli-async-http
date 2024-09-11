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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncRequestArgs = exports.AsyncRequestConfig = exports.AsyncRequestRepository = void 0;
var ezyli_ws_1 = require("ezyli-ws");
var utils_1 = require("./utils");
var requestFinished = "completed";
var requestProgressing = "progressing";
var AsyncRequestConfig = /** @class */ (function () {
    function AsyncRequestConfig(_a) {
        var shouldNotifyFn = _a.shouldNotifyFn, callBackFn = _a.callBackFn, checkIsVerboseFn = _a.checkIsVerboseFn, onVerboseCallback = _a.onVerboseCallback, onTimeoutCallback = _a.onTimeoutCallback, requestId = _a.requestId, waitTimeoutMillis = _a.waitTimeoutMillis;
        this.shouldNotifyFn = shouldNotifyFn;
        this.callBackFn = callBackFn;
        this.checkIsVerboseFn = checkIsVerboseFn;
        this.onVerboseCallback = onVerboseCallback;
        this.onTimeoutCallback = onTimeoutCallback;
        this.requestId = requestId;
        this.waitTimeoutMillis = waitTimeoutMillis;
    }
    return AsyncRequestConfig;
}());
exports.AsyncRequestConfig = AsyncRequestConfig;
var AsyncRequestArgs = /** @class */ (function () {
    function AsyncRequestArgs(_a) {
        var waitAsyncResultTimeoutMillis = _a.waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution = _a.maxRetryForRetrieveSolution, submitRequestTimeoutMillis = _a.submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis = _a.retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis = _a.retryRetriveSolutionIntervalMillis, appName = _a.appName, wsResponse = _a.wsResponse, wsHeaders = _a.wsHeaders, onVerboseCallback = _a.onVerboseCallback;
        this.waitAsyncResultTimeoutMillis = waitAsyncResultTimeoutMillis;
        this.maxRetryForRetrieveSolution = maxRetryForRetrieveSolution;
        this.submitRequestTimeoutMillis = submitRequestTimeoutMillis;
        this.retrieveSolutionTimeoutMillis = retrieveSolutionTimeoutMillis;
        this.retryRetriveSolutionIntervalMillis =
            retryRetriveSolutionIntervalMillis;
        this.appName = appName;
        this.wsResponse = wsResponse;
        this.wsHeaders = wsHeaders;
        this.onVerboseCallback = onVerboseCallback;
    }
    return AsyncRequestArgs;
}());
exports.AsyncRequestArgs = AsyncRequestArgs;
var AsyncRequestRepository = /** @class */ (function () {
    function AsyncRequestRepository() {
        if (!AsyncRequestRepository.instance) {
            AsyncRequestRepository.instance = this;
        }
        this.defaultOptions = new AsyncRequestArgs({
            waitAsyncResultTimeoutMillis: 5 * 1000 * 60, // 5 minutes
            maxRetryForRetrieveSolution: 15, // 5 times
            submitRequestTimeoutMillis: 5 * 1000 * 60, // 5 minutes
            retrieveSolutionTimeoutMillis: 5 * 1000 * 60, // 5 minutes
            retryRetriveSolutionIntervalMillis: 5 * 1000, // 5 seconds
            wsHeaders: true,
            wsResponse: true,
        });
        return AsyncRequestRepository.instance;
    }
    //the setDefault methods
    AsyncRequestRepository.prototype.setDefaults = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        // this.defaultOptions = options;
        //set the default options
        this.defaultOptions = new AsyncRequestArgs({
            waitAsyncResultTimeoutMillis: (_a = options.waitAsyncResultTimeoutMillis) !== null && _a !== void 0 ? _a : this.defaultOptions.waitAsyncResultTimeoutMillis,
            maxRetryForRetrieveSolution: (_b = options.maxRetryForRetrieveSolution) !== null && _b !== void 0 ? _b : this.defaultOptions.maxRetryForRetrieveSolution,
            submitRequestTimeoutMillis: (_c = options.submitRequestTimeoutMillis) !== null && _c !== void 0 ? _c : this.defaultOptions.submitRequestTimeoutMillis,
            retrieveSolutionTimeoutMillis: (_d = options.retrieveSolutionTimeoutMillis) !== null && _d !== void 0 ? _d : this.defaultOptions.retrieveSolutionTimeoutMillis,
            retryRetriveSolutionIntervalMillis: (_e = options.retryRetriveSolutionIntervalMillis) !== null && _e !== void 0 ? _e : this.defaultOptions.retryRetriveSolutionIntervalMillis,
            appName: (_f = options.appName) !== null && _f !== void 0 ? _f : this.defaultOptions.appName,
            wsResponse: (_g = options.wsResponse) !== null && _g !== void 0 ? _g : this.defaultOptions.wsResponse,
            wsHeaders: (_h = options.wsHeaders) !== null && _h !== void 0 ? _h : this.defaultOptions.wsHeaders,
            onVerboseCallback: (_j = options.onVerboseCallback) !== null && _j !== void 0 ? _j : this.defaultOptions.onVerboseCallback,
        });
    };
    AsyncRequestRepository.prototype.setCurrentHttpClient = function (httpClient) {
        this._httpClient = httpClient;
    };
    //wait ws result function (a promise)
    AsyncRequestRepository.prototype.waitWsResult = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _websocketHandler, waitResultPromiseIsResolved, waitResultPromise, timeoutPromise, promises;
            var _this = this;
            return __generator(this, function (_a) {
                _websocketHandler = new ezyli_ws_1.WebsocketHandler();
                waitResultPromiseIsResolved = false;
                waitResultPromise = new Promise(function (resolve, reject) {
                    var sub = new ezyli_ws_1.WebSocketSubscription({
                        id: config.requestId,
                        shouldNotify: function (data) { return config.shouldNotifyFn(data); },
                        callback: function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var isVerboseEvent;
                            var _a;
                            return __generator(this, function (_b) {
                                isVerboseEvent = (_a = config.checkIsVerboseFn(data)) !== null && _a !== void 0 ? _a : false;
                                if (isVerboseEvent) {
                                    //call the callback
                                    config.onVerboseCallback(data);
                                }
                                else {
                                    //finish
                                    _websocketHandler.cancelSubscriptionById(config.requestId);
                                    //resolve or reject the promise
                                    config.callBackFn(data).then(function (res) { return resolve(res); }).catch(function (err) {
                                        console.log("************************************************[waitWsResult] error in callBackFn", err.message);
                                        reject(err);
                                    }).finally(function () {
                                        waitResultPromiseIsResolved = true;
                                    });
                                }
                                return [2 /*return*/];
                            });
                        }); },
                    });
                    _websocketHandler.subscribe(sub);
                });
                timeoutPromise = new Promise(function (resolveOfTimeout, rejectOfTimeout) {
                    //start a setTimeout
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            //check if the waitPromise is not completed then cancel it
                            if (!waitResultPromiseIsResolved) {
                                console.log("[Async Request] the ws is not too fast. let execute my own timeout callback", config.waitTimeoutMillis);
                                //stop the subscription
                                _websocketHandler.cancelSubscriptionById(config.requestId);
                                //call on timeout callback
                                config.onTimeoutCallback().then(function (res) { return resolveOfTimeout(res); }).catch(function (err) { return rejectOfTimeout(err); });
                            }
                            return [2 /*return*/];
                        });
                    }); }, config.waitTimeoutMillis);
                });
                promises = [waitResultPromise, timeoutPromise];
                //wait for the first promise
                return [2 /*return*/, (0, utils_1.promiseAny)(promises)];
            });
        });
    };
    AsyncRequestRepository.prototype.makeSyncRequest = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._httpClient.request(__assign({}, config))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    // async get 
    AsyncRequestRepository.prototype.get = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign({ url: url, method: utils_1.RequestMethods.GET }, config))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // async post
    AsyncRequestRepository.prototype.post = function (url, config, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign(__assign({ url: url, method: utils_1.RequestMethods.POST }, config), { data: data }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // async put
    AsyncRequestRepository.prototype.put = function (url, config, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign(__assign({ url: url, method: utils_1.RequestMethods.PUT }, config), { data: data }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // async delete
    AsyncRequestRepository.prototype.delete = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign({ url: url, method: utils_1.RequestMethods.DELETE }, config))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //  async patch
    AsyncRequestRepository.prototype.patch = function (url, config, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign(__assign({ url: url, method: utils_1.RequestMethods.PATCH }, config), { data: data }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //  async head
    AsyncRequestRepository.prototype.head = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign({ url: url, method: utils_1.RequestMethods.HEAD }, config))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //  async options
    AsyncRequestRepository.prototype.options = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeSyncRequest(__assign({ url: url, method: utils_1.RequestMethods.OPTIONS }, config))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //  static create with http client 
    AsyncRequestRepository.create = function (httpClient) {
        var asyncRequest = new AsyncRequestRepository();
        asyncRequest.setCurrentHttpClient(httpClient);
        return asyncRequest;
    };
    //get the instance
    AsyncRequestRepository.getInstance = function () {
        return this.instance;
    };
    AsyncRequestRepository.prototype._retrieveResponse = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var url;
            var _this = this;
            var routingId = _b.routingId, _c = _b.actualRetryCount, actualRetryCount = _c === void 0 ? 0 : _c, maxRetryForRetrieveSolution = _b.maxRetryForRetrieveSolution, retryRetriveSolutionIntervalMillis = _b.retryRetriveSolutionIntervalMillis, retrieveSolutionTimeoutMillis = _b.retrieveSolutionTimeoutMillis;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        //this function will be called recursively until the response is ready
                        //or the maxRetryForRetrieveSolution is reached
                        //check the actualRetryCount
                        if (actualRetryCount == 0) {
                            console.log("[Async Request] trying to retrieve the response");
                        }
                        else {
                            console.log("[Async Request] retrying to retrieve the response", actualRetryCount);
                        }
                        url = "/i/retrieve-solution/";
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.makeSyncRequest({
                                    url: url,
                                    method: utils_1.RequestMethods.GET,
                                    params: {
                                        id: routingId,
                                    },
                                })
                                    .then(function (response) {
                                    resolve(response);
                                })
                                    .catch(function (error) {
                                    var _a, _b;
                                    // some check before return the error
                                    //check if it's internetConnexion error or timeout ...
                                    var isTimeoutError = error.code === "ECONNABORTED" || error.code === "ENOTFOUND";
                                    var isApi404Error = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404;
                                    var body = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data;
                                    var isExecutor404 = (body === null || body === void 0 ? void 0 : body["IS_EXECUTOR_404"]) === true;
                                    var reponseIsNotYetAvailable = !isExecutor404;
                                    var isApi404ErrorBecauseOfExecutorNotFinished = isApi404Error && reponseIsNotYetAvailable;
                                    var isCorrectError = isTimeoutError || isApi404ErrorBecauseOfExecutorNotFinished;
                                    var canRetryAgain = actualRetryCount < maxRetryForRetrieveSolution;
                                    var shouldRetry = isCorrectError && canRetryAgain;
                                    console.log("[Async Request] shouldRetry", shouldRetry, "isCorrectError : ", isCorrectError, "canRetryAgain : ", canRetryAgain);
                                    if (shouldRetry) {
                                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, this._retrieveResponse({
                                                            routingId: routingId,
                                                            actualRetryCount: actualRetryCount + 1,
                                                            maxRetryForRetrieveSolution: maxRetryForRetrieveSolution,
                                                            retryRetriveSolutionIntervalMillis: retryRetriveSolutionIntervalMillis,
                                                            retrieveSolutionTimeoutMillis: retrieveSolutionTimeoutMillis,
                                                        })];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); }, retryRetriveSolutionIntervalMillis);
                                    }
                                    else {
                                        //return the error
                                        reject(error);
                                    }
                                });
                            })];
                    case 1: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    AsyncRequestRepository.prototype.makeAsyncRequest = function (syncConfig, asyncConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var appName, waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution, submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis, wsResponse, wsHeaders, originalParams, params, strWsResponse, strWsHeaders;
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                appName = (_a = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.appName) !== null && _a !== void 0 ? _a : this.defaultOptions.appName;
                waitAsyncResultTimeoutMillis = (_b = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.waitAsyncResultTimeoutMillis) !== null && _b !== void 0 ? _b : this.defaultOptions.waitAsyncResultTimeoutMillis;
                maxRetryForRetrieveSolution = (_c = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.maxRetryForRetrieveSolution) !== null && _c !== void 0 ? _c : this.defaultOptions.maxRetryForRetrieveSolution;
                submitRequestTimeoutMillis = (_d = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.submitRequestTimeoutMillis) !== null && _d !== void 0 ? _d : this.defaultOptions.submitRequestTimeoutMillis;
                retrieveSolutionTimeoutMillis = (_e = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.retrieveSolutionTimeoutMillis) !== null && _e !== void 0 ? _e : this.defaultOptions.retrieveSolutionTimeoutMillis;
                retryRetriveSolutionIntervalMillis = (_f = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.retryRetriveSolutionIntervalMillis) !== null && _f !== void 0 ? _f : this.defaultOptions.retryRetriveSolutionIntervalMillis;
                wsResponse = (_g = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.wsResponse) !== null && _g !== void 0 ? _g : this.defaultOptions.wsResponse;
                wsHeaders = (_h = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.wsHeaders) !== null && _h !== void 0 ? _h : this.defaultOptions.wsResponse;
                originalParams = (_j = syncConfig === null || syncConfig === void 0 ? void 0 : syncConfig.params) !== null && _j !== void 0 ? _j : {};
                params = __assign(__assign({}, originalParams), { "app": appName });
                strWsResponse = wsResponse ? "1" : "0";
                strWsHeaders = wsHeaders ? "1" : "0";
                //add wsResponse and wsHeaders to params
                params["ws_response"] = strWsResponse;
                params["ws_headers"] = strWsHeaders;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        //make the original request
                        _this.makeSyncRequest(__assign(__assign({}, syncConfig), { params: params, timeout: submitRequestTimeoutMillis })).then(function (res) {
                            var response = res;
                            var data = response.data["data"];
                            var routingKey = data["routing_id"];
                            console.log("[Async Request] routingKey", routingKey);
                            //wait for the ws response
                            var waitConfig = new AsyncRequestConfig({
                                requestId: routingKey,
                                waitTimeoutMillis: waitAsyncResultTimeoutMillis,
                                shouldNotifyFn: function (rawWsData) {
                                    var _a;
                                    var wsData = (_a = rawWsData["data"]) !== null && _a !== void 0 ? _a : {};
                                    var wsRoutingKey = wsData["routing_id"];
                                    // the state to know if it's completed
                                    var state = wsData["state"];
                                    var stateIsCompleted = state === requestFinished;
                                    var stateIsProgressing = state === requestProgressing;
                                    if (routingKey === wsRoutingKey) {
                                        return stateIsCompleted || stateIsProgressing;
                                    }
                                    else {
                                        return false;
                                    }
                                },
                                callBackFn: function (rawWsData) {
                                    return new Promise(function (resolveOfCallBack, rejectOfCallback) {
                                        var _a;
                                        var wsData = (_a = rawWsData["data"]) !== null && _a !== void 0 ? _a : {};
                                        console.log("[Async Request] wait response via websocket finished", wsData);
                                        //check if data has full response
                                        var hasResponse = wsData["has_response"];
                                        if (hasResponse) {
                                            var responseContent = wsData["response"];
                                            var resJson = responseContent["json"];
                                            var resHeaders = responseContent["headers"];
                                            var statusCode = responseContent["status_code"];
                                            //console.log("[Async Request] data of the response is present in the response" , resJson , resHeaders, statusCode);
                                            //create a response object
                                            //console.log("***************************" ,response.request, statusCode, resJson, resHeaders )
                                            var fakeResponse = (0, utils_1.axiosResponseFromStatusCode)(response.request, statusCode, resJson, resHeaders);
                                            //console.log("********************************* type", typeof fakeResponse , fakeResponse instanceof Error);
                                            //check if response is Axios error then reject
                                            if (fakeResponse instanceof Error) {
                                                rejectOfCallback(fakeResponse);
                                            }
                                            else {
                                                //build fake promise and return
                                                resolveOfCallBack(fakeResponse);
                                            }
                                        }
                                        else {
                                            console.log("[Async Request] response ws but the data is not in the response");
                                            //retrieve the response
                                            _this._retrieveResponse({
                                                routingId: routingKey,
                                                maxRetryForRetrieveSolution: maxRetryForRetrieveSolution,
                                                actualRetryCount: 0,
                                                retryRetriveSolutionIntervalMillis: retryRetriveSolutionIntervalMillis,
                                                retrieveSolutionTimeoutMillis: retrieveSolutionTimeoutMillis,
                                            }).then(function (res) { return resolveOfCallBack(res); })
                                                .catch(function (err) { return rejectOfCallback(err); });
                                        }
                                    });
                                },
                                checkIsVerboseFn: function (wsData) {
                                    var wsRoutingKey = wsData["routing_id"];
                                    var state = wsData["state"];
                                    var isInProgress = state === requestProgressing;
                                    return routingKey === wsRoutingKey && isInProgress;
                                },
                                onVerboseCallback: function (wsData) {
                                    var _a;
                                    console.log("[Async Request] verboseCallback: ", wsData);
                                    var verboseData = wsData["verbose_data"];
                                    //call the verbose callback
                                    (_a = asyncConfig === null || asyncConfig === void 0 ? void 0 : asyncConfig.onVerboseCallback) === null || _a === void 0 ? void 0 : _a.call(asyncConfig, verboseData);
                                },
                                onTimeoutCallback: function () {
                                    return new Promise(function (resolveOfTimeOut, rejectOfTimeOut) {
                                        //console.log("[Async Request] timeoutCallback");
                                        console.log("[Async Request] Executing onTimeOutCallback (too long to wait for the response via ws)");
                                        //retry to retrieve the response
                                        _this._retrieveResponse({
                                            routingId: routingKey,
                                            maxRetryForRetrieveSolution: maxRetryForRetrieveSolution,
                                            actualRetryCount: 0,
                                            retryRetriveSolutionIntervalMillis: retryRetriveSolutionIntervalMillis,
                                            retrieveSolutionTimeoutMillis: retrieveSolutionTimeoutMillis,
                                        }).then(function (res) { return resolveOfTimeOut(res); })
                                            .catch(function (err) { return rejectOfTimeOut(err); });
                                    });
                                },
                            });
                            //wait for the result
                            _this.waitWsResult(waitConfig).then(function (res) { return resolve(res); })
                                .catch(function (err) {
                                console.log("**********************************[Async Request] error in waitWsResult", err.message);
                                reject(err);
                            });
                        })
                            .catch(function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    //async get
    AsyncRequestRepository.prototype.aGet = function (url, asyncConfig, syncConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeAsyncRequest(__assign(__assign({}, syncConfig), { url: url, method: utils_1.RequestMethods.GET }), asyncConfig)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //async post
    AsyncRequestRepository.prototype.aPost = function (url, asyncConfig, syncConfig, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeAsyncRequest(__assign(__assign({}, syncConfig), { url: url, method: utils_1.RequestMethods.POST, data: data }), asyncConfig)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //async put
    AsyncRequestRepository.prototype.aPut = function (url, asyncConfig, syncConfig, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeAsyncRequest(__assign(__assign({}, syncConfig), { url: url, method: utils_1.RequestMethods.PUT, data: data }), asyncConfig)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //async delete
    AsyncRequestRepository.prototype.aDelete = function (url, asyncConfig, syncConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeAsyncRequest(__assign(__assign({}, syncConfig), { url: url, method: utils_1.RequestMethods.DELETE }), asyncConfig)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //async patch
    AsyncRequestRepository.prototype.aPatch = function (url, asyncConfig, syncConfig, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeAsyncRequest(__assign(__assign({}, syncConfig), { url: url, method: utils_1.RequestMethods.PATCH, data: data }), asyncConfig)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return AsyncRequestRepository;
}());
exports.AsyncRequestRepository = AsyncRequestRepository;
