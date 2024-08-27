import axios from "axios";
import { AsyncRequestRepository } from "./dist/index.js";



axios.get('https://jsonplaceholder.typicode.com/todos/1', {
  timeout: 10000  
})
    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        // check if error is timeout
        console.log(error.response);
        if(error.code === 'ECONNABORTED'){
            console.log('timeout');
        }
    })


    let asynRequest = AsyncRequestRepository()

    // axios instance with default options

    const instance = axios.create({
        baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
        timeout: 1000,
        headers: {'X-Custom-Header': 'foobar'}
      });


    asynRequest.setCurrentHttpClient(instance)
