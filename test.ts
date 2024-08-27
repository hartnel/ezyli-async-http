import axios, { Axios, AxiosResponse } from "axios";
import { AsyncRequestRepository } from "./src/index";
import { WebsocketHandler } from "ezyli-ws";



let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwODQzMzQ2LCJpYXQiOjE3MjQ3NzI5NDYsImp0aSI6IjMyMWYzZGVlZGY0YjRlODliZjhkYmFhYmViNTM5N2RiIiwidXNlcl9pZCI6MX0.fHx7_wwjKAg13logU5pxNrMVinPT69MefFv9bZXl87Y"
let channel = "SERVICE-1";
let wsUrl = `ws://57.128.166.240:8080/ws/socket-server/?token=${token}&channel_name=${channel}`;

console.log("wsUrl", wsUrl);


let ws = new WebsocketHandler();
ws.listenForWebsocketEvents(wsUrl);
ws.onNewData = ((data:any) => {
  console.log("new data", data);
});

function run(){
  let instance = axios.create({
  baseURL: 'http://57.128.166.240:8080',
  timeout: 10000,
  headers: {'Authorization': `Bearer ${token}`}
});

let asynRequest =  AsyncRequestRepository.create(instance);
asynRequest.setDefaults({
  appName : "EZYTAKO_IC_DRIVER",
});

//try to get 
let requestListUrl = "/dashboard/administrator/travel-request/?page=1&limit=20&order_by=-created_at";
let locationsUrl = "/i/routing/search/";

// asynRequest.get(requestListUrl).then((response) => {
//   console.log("requests List",   (response as AxiosResponse).data);
// }).catch((error) => {
//   console.log(error);
// });

asynRequest.makeAsyncRequest({
  url:locationsUrl,
  method: "get",
  params : {"query" : "Total Melen"},
} ,  {
  wsHeaders : true,
  wsResponse : true,
}).then((response) => {
  console.log("locations",   (response as AxiosResponse).data);
}).catch((error) => {
  console.log(error);
});


}

run();



// try async request

