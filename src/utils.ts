import axios, { AxiosError, AxiosResponse } from "axios"


enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}



//fake axios responses


const axiosTimeoutError = (request? : any): AxiosError => {
    
    const errorObject = {
        code: 'ECONNABORTED',
        request: request,
        message: 'timeout',
        response: null,


    }

    return new AxiosError(errorObject.message, errorObject.code, errorObject.request, errorObject.response)
};




const axiosResponseFromStatusCode = (request: any, statusCode: number, data: any, headers: any): AxiosResponse | AxiosError => {
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
        const  errorOject = new AxiosError(
           request.code,
           request.message,
           request,


            
        )

        return errorOject
    }
};
//




export { RequestMethods, axiosTimeoutError }

