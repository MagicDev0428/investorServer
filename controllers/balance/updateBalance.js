import {
    Models
} from "../../models";

import { Lib } from "../../utils";
const {getInvestorNickName} = require("../investor/getInvestor")
const factory = require("../../utils/factories/google");

// creating balance table model
let balanceTable = Models.balanceModel;


// 
// Update EXISTING Balance with the data from the form
//
export const updateBalance = (req) => {

    global.show("###### update balance ######")
    let received = req ? req.body : null;
    // if (received) global.show({
    //     received
    // });

    console.log(received)
    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!received._id) {
                return reject({err:true,message:"_id is not recieved in form."});
            }


            const dateTime = new Date().toISOString();
            received.modifiedDate = dateTime;

           // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.modifiedBy = userName?userName:"";


            
            // checking id exists in myInvestments
            const investorFolders = await Models.Investor.findOne({
                    _id: received.investorName
                },
                'folders'
            );
            if (!investorFolders) {
                return reject({
                    status: 403,
                    err: true,
                    message: "Investor name does not exist!",
                });
            }

             // Get the google drive client
            const client = factory.getGoogleDriveInstance();
            //  if deposit is greater than 0 so it's mean it need to upload in deposit folder otherwise in withdraw folder
            const folderId = Number(received.deposit) > 0 ? investorFolders.folders.depositFolderId:investorFolders.folders.withdrawFolderId ;
            let attachments = received?.attachments ? JSON.parse(received.attachments):null;

            if(attachments){
            // Delete file if user has deleted the saved file in google drive
            for (let item of attachments) {
                // if image is deleted then delete from google drive
                if (!item.filePath) {
                    if (item.googleFileId) {
                        await client.deleteFile(item.googleFileId);
                        }
                    }
                }     
                attachments = attachments.filter(item => item.filePath);
            }

            async function prepareAttachmentResponse(imagePath, documentType, parentFolderId) {
                let fileId = await client.uploadFile("uploads/" + imagePath, parentFolderId);
                // Get weblink of file
                let webLink = await client.getWebLink(fileId.id);
                if (fileId) {
                    attachments.push({
                        filePath: imagePath,
                        googleFileId: fileId.id,
                        folderId: parentFolderId,
                        webLink: webLink
                    });
                    // Delete this uploaded file in server
                    await Lib.deleteFile("uploads/" + imagePath);
                }
            }

                        // Upload passport images
            if (received.receipt) {
                if (Array.isArray(received.receipt)) {
                    for (const imagePath of received?.receipt) {
                        await prepareAttachmentResponse(imagePath, 'receipts', folderId)
                    }
                } else {
                    await prepareAttachmentResponse(received.receipt, 'receipts', folderId)
                }
            }

            // adding attachments
            received.attachments = attachments

            balanceTable = null;
            balanceTable = await Models.balanceModel.findOneAndUpdate({
                    _id: received._id
                },
                received, {
                    new: true
                }
            );

            if(!balanceTable){
                return reject({
                    err:true,
                    message:`Balance id ${balanceId} is not exist!`
                })
            }
            // get investor nick name
            let  {investors} = await getInvestorNickName(balanceTable.investorName)
           
            // save log for update adam
            global.saveLogs({
                logType:'Balance',
                investorName:investors.nickname,
                description:`Update Balance from ${investors.nickname} for ฿${balanceTable.deposit.toLocaleString()}.`,
            })
            
            return resolve({
                err: false,
                balances: balanceTable
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })
}