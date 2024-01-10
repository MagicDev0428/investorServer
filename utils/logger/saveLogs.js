import { Models } from "../../models";

global.saveLogs = async(logsData)=>{
    logsData._id = new Date().getTime()
    logsData.logBy =  global.userName;

    const newlog = new Models.logModel(logsData);
    await newlog.save();
}