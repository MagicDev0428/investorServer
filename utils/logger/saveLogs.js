import { Models } from "../../models";

global.saveLogs = async(logsData)=>{
try {
    logsData._id = new Date().getTime()
    logsData.logBy =  global.userName;

    const newlog = new Models.logModel(logsData);
    await newlog.save();
} catch (error) {
    console.log("error in save logs ");
}
    
}