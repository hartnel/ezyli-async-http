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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncRequestArgs = exports.AsyncRequestConfig = exports.AsyncRequestRepository = void 0;
var axios_1 = __importDefault(require("axios"));
var ezyli_ws_1 = require("ezyli-ws");
var utils_1 = require("./utils");
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
        var waitAsyncResultTimeoutMillis = _a.waitAsyncResultTimeoutMillis, maxRetryForRetrieveSolution = _a.maxRetryForRetrieveSolution, submitRequestTimeoutMillis = _a.submitRequestTimeoutMillis, retrieveSolutionTimeoutMillis = _a.retrieveSolutionTimeoutMillis, retryRetriveSolutionIntervalMillis = _a.retryRetriveSolutionIntervalMillis, appName = _a.appName;
        this.waitAsyncResultTimeoutMillis = waitAsyncResultTimeoutMillis;
        this.maxRetryForRetrieveSolution = maxRetryForRetrieveSolution;
        this.submitRequestTimeoutMillis = submitRequestTimeoutMillis;
        this.retrieveSolutionTimeoutMillis = retrieveSolutionTimeoutMillis;
        this.retryRetriveSolutionIntervalMillis =
            retryRetriveSolutionIntervalMillis;
        this.appName = appName;
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
        });
        return AsyncRequestRepository.instance;
    }
    //the setDefault methods
    AsyncRequestRepository.prototype.setDefaults = function (options) {
        this.defaultOptions = options;
    };
    AsyncRequestRepository.prototype.setCurrentHttpClient = function (httpClient) {
        this._httpClient = httpClient;
    };
    //check before make requests
    //insure that appName is set
    AsyncRequestRepository.prototype.checkBeforeRequest = function (options) {
        if (!options.appName) {
            throw new Error("appName is required");
        }
    };
    //wait ws result function (a promise)
    AsyncRequestRepository.prototype.waitWsResult = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _websocketHandler, waitResultPromiseIsResolved, waitResultPromise, timeoutPromise, promises, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _websocketHandler = new ezyli_ws_1.WebsocketHandler();
                        waitResultPromiseIsResolved = false;
                        waitResultPromise = new Promise(function (resolve, reject) {
                            var sub = new ezyli_ws_1.WebSocketSubscription({
                                id: config.requestId,
                                shouldNotify: function (data) { return config.shouldNotifyFn(data); },
                                callback: function (data) { return __awaiter(_this, void 0, void 0, function () {
                                    var isVerboseEvent, res;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                isVerboseEvent = (_a = config.checkIsVerboseFn(data)) !== null && _a !== void 0 ? _a : false;
                                                if (!isVerboseEvent) return [3 /*break*/, 1];
                                                //call the callback
                                                config.callBackFn(data);
                                                return [3 /*break*/, 3];
                                            case 1:
                                                //finish
                                                _websocketHandler.cancelSubscriptionById(config.requestId);
                                                return [4 /*yield*/, config.callBackFn(data)];
                                            case 2:
                                                res = _b.sent();
                                                //resolve the promise
                                                resolve(res);
                                                _b.label = 3;
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); },
                            });
                            _websocketHandler.subscribe(sub);
                        });
                        timeoutPromise = new Promise(function (resolve, reject) {
                            //start a setTimeout
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var res;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!!waitResultPromiseIsResolved) return [3 /*break*/, 2];
                                            //stop the subscription
                                            _websocketHandler.cancelSubscriptionById(config.requestId);
                                            return [4 /*yield*/, config.onTimeoutCallback()];
                                        case 1:
                                            res = _a.sent();
                                            //resolve the promise
                                            resolve(res);
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }, config.waitTimeoutMillis);
                        });
                        promises = [waitResultPromise, timeoutPromise];
                        return [4 /*yield*/, Promise.reject()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    AsyncRequestRepository.prototype.makeSyncRequest = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, axios_1.default)(__assign({}, config))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    AsyncRequestRepository.prototype._retrieveResponse = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var url;
            var _this = this;
            var routingId = _b.routingId, _c = _b.actualRetryCount, actualRetryCount = _c === void 0 ? 0 : _c, maxRetryForRetrieveSolution = _b.maxRetryForRetrieveSolution, retryRetriveSolutionIntervalMillis = _b.retryRetriveSolutionIntervalMillis, retrieveSolutionTimeoutMillis = _b.retrieveSolutionTimeoutMillis;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
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
                                    var reponseIsNotAvailable = !isExecutor404;
                                    var isCorrectError = isTimeoutError || isApi404Error || reponseIsNotAvailable;
                                    var canRetryAgain = actualRetryCount < maxRetryForRetrieveSolution;
                                    var shouldRetry = isCorrectError && canRetryAgain;
                                    if (shouldRetry) {
                                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        console.log("retrying to retrieve the response");
                                                        return [4 /*yield*/, this._retrieveResponse({
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
    return AsyncRequestRepository;
}());
exports.AsyncRequestRepository = AsyncRequestRepository;
