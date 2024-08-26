import axios from "axios";



axios.get('https://jsonplaceholder.typicode.com/todos/1', {
  timeout: 10000  
})
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        // check if error is timeout
        console.log(error.response);
        if(error.code === 'ECONNABORTED'){
            console.log('timeout');
        }
    })
