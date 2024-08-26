import axios, { AxiosError, AxiosResponse } from "axios"


enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}



//fake axios responses

const axiosTimeoutError = (request? : any): AxiosError => {
    return {
        config: request,
        isAxiosError: true,
        name: 'TimeoutError',
        message: 'timeout of 1000ms exceeded',
        toJSON: () => { return {} }
    }

};