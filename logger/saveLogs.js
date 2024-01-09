import { Models } from "../models";



global.saveLogs = (logsData)=>{
    logsData._id = new Date().getTime()
    console.log("i am global log.",logsData);
}