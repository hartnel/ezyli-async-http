import axios, { AxiosError, AxiosResponse } from "axios"

type ApiReponse = AxiosResponse | AxiosError | Error;
enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS'
}



//fake axios responses

function promiseAny(promises: Promise<any>[]): Promise<any> {
    return new Promise((resolve, reject) => {
        let errors: any[] = [];
        let resolved = false;

        promises.forEach((promise, index) => {
            promise
                .then(value => {
                    if (!resolved) {
                        resolved = true;
                        resolve(value);
                    }
                })
                .catch(error => {

                    if(!resolved){
                        resolved = true;
                        reject(error);
                    }
                });
        });
    });
}


const axiosTimeoutError = (request? : any): AxiosError => {
    
    const errorObject = {
        code: 'ECONNABORTED',
        request: request,
        message: 'timeout',
        response: null,


    }

    return new AxiosError(errorObject.message, errorObject.code, errorObject.request, errorObject.response)
};




const axiosResponseFromStatusCode = (request: any, statusCode: number, data: any, headers: any): any => {
    const responseObject = {
        data: data,
        status: statusCode,
        statusText: '',
        headers: {
            ...headers
        },
        request : null,
        config: {
            ...request
        }
    }
    

    if (statusCode >= 200 && statusCode < 300) {
        return responseObject
    }else {
        //  make error object using status code data and headers
        //build axios error object
        let error = new AxiosError(
            'Request failed with status code ' + statusCode, //message
            statusCode.toString(), //code
            responseObject.config, // config
            request, //request
            responseObject, //response
        )

        return error;
    }
};
//




export { RequestMethods, axiosTimeoutError,promiseAny, axiosResponseFromStatusCode, ApiReponse }

