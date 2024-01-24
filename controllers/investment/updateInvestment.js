//
// Update Investment
//
import {
    Models
} from "../../models";

import { Lib } from "../../utils";

const factory = require("../../utils/factories/google");
// creating table model
let investmentTable = Models.investmentModel;

//
// Update EXISTING investment with the data from the form
//
export const updateInvestment = (req) => {
    global.show("###### investmentSave ######");
    let received = req ? req.body : null;
    console.log(received);

    return new Promise(async (resolve, reject) => {

        try {
            // check recieved._id exists
            const investmentExists = await Models.investmentModel.exists({
                _id: received?._id,
            });

            if (!investmentExists) {
                return reject({
                    err: true,
                    message: `investment id ${received._id} is not exist!`,
                });
            }


            const dateTime = new Date().toISOString();
            received.modifiedDate = dateTime;
           // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.modifiedBy = userName?userName:"";

            received.name =  received.name.replace(/[./]/g, "");
            const client = factory.getGoogleDriveInstance(); 
            let attachments = JSON.parse(received.attachments);  

                  // Delete file if user has deleted the saved file in google drive
            for (let item of attachments.receipts) {
                // if image is deleted then delete from google drive
                if (!item.filePath) {
                if(item.googleFileId) {
                    await client.deleteFile(item.googleFileId);
                }          
                }
            }
            attachments.receipts = attachments.receipts.filter(item => item.filePath);

            async function prepareAttachmentResponse(imagePath, documentType, parentFolderId) {
                let fileId = await client.uploadFile("uploads/" + imagePath, parentFolderId);
                    // Get weblink of file
                    let webLink = await client.getWebLink(fileId.id);
                    if (fileId) {
                    attachments[documentType].push({
                        filePath: imagePath,
                        googleFileId: fileId.id,
                        folderId: parentFolderId,
                        webLink: webLink
                    });
                    // Delete this uploaded file in server
                    await Lib.deleteFile("uploads/" + imagePath);
                    }
            }

                              
            if(received.receipt) {        
                if(Array.isArray(received.receipt)) {
                for (const imagePath of received?.receipt) {
                    await prepareAttachmentResponse(imagePath, 'receipts', investmentReceiptFolder.id)
                }
                } else {
                await prepareAttachmentResponse(received.receipt, 'receipts', investmentReceiptFolder.id);
                }    
            } 

            let updatedFolderName = await client.renameFolder(attachments.investmentFolderId, `[${received._id}] ${received.name}`); 
            console.log(updatedFolderName)
            investmentTable = null;

            investmentTable = await Models.investmentModel.findByIdAndUpdate(received._id, received, {
                new: true,
            });
          
            if (investmentTable) {


             
                 // save log for to create investment 
                global.saveLogs({
                    logType:'Investment',
                    investmentNo:investmentTable._id,
                    description:`Updated the Investment ${investmentTable._id} for ${investmentTable.investAmount}.`,
                })
                return resolve({
                    status: 200,
                    err: false,
                    investments: investmentTable
                });
            }
            return reject({
                status: 404,
                err: true,
                message: `Investment ${_id} Not Found!`,
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};