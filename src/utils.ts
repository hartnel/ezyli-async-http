import axios, { AxiosError, AxiosResponse } from "axios"


enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}



//fake axios responses


const axiosTimeoutError = (request? : any): AxiosError => {
    return AxiosError();
};

const asiosResponseFromStatusCode = (statusCode: number, data: any): AxiosResponse => {};

//




export { RequestMethods, axiosTimeoutError }

