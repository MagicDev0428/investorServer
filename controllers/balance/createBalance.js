//
// Create balances
//

import {
    Models
} from "../../models";

import{Lib} from "../../utils"
const {getInvestorNickName} = require("../investor/getInvestor")
const factory = require("../../utils/factories/google");
// creating Balance table model
let balanceTable = Models.balanceModel;



//
// Create NEW Balance with the data from the form
//
export const createBalance = (req) => {

    global.show("###### Create Balance ######")
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {

        try {

            // Checking if investor body is empty or not
            if (!received) {
                return reject({
                    err: true,
                    message: "Balance form is empty!",
                });
            }


            if(!received.profitMonth || !received.investorName){
                return reject({
                    err: true,
                    message: "Check balance form investorName and profitMonth are required!",
                });
            }

            // date and time in createDate and modified date
            const dateTime = new Date().toISOString();
            received.createdDate = dateTime;
            received.modifiedDate =dateTime;

            // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.createdBy = userName?userName:"";
            received.modifiedBy = userName?userName:"";


              // check recieved.investorName exist in investors or not
            // checking id exists in myInvestments
            const investorFolders = await Models.Investor.findOne(
                    { _id: received.investorName },
                    'folders'
                );
            if (!investorFolders) {
                return reject({
                   
                    err: true,
                    message: "Investor id does not exist!",
                });
            }


            const client = factory.getGoogleDriveInstance();
            //  if deposit is greater than 0 so it's mean it need to upload in deposit folder otherwise in withdraw folder
            const folderId = Number(received.deposit) > 0 ? investorFolders.folders.depositFolderId:investorFolders.folders.withdrawFolderId ;
            
            let attachments = []

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
      if(received.receipt ) {
        // receipts
       
        if(Array.isArray(received.receipt)) {
          for (const imagePath of received?.receipt) {
            await prepareAttachmentResponse(imagePath, 'receipts', folderId)
          }
        } else {
          await prepareAttachmentResponse(received.receipt, 'receipts', folderId)         
        }      
      } 
            // creating new balances instance
            const newbalances = new Models.balanceModel(received);

            balanceTable = null;
            balanceTable = await newbalances.save();

            // Create the balances in "balances" collection

            if (balanceTable) {
                let  {investors} = await getInvestorNickName(balanceTable.investorName)
                let logDesc = '';
                if(balanceTable.deposit>0 && balanceTable.profitMonthPaid){
                    logDesc = `New Balance,  ${investors.nickname} was paid ${balanceTable.deposit} as Monthly Profit.`
                }else if(balanceTable.deposit > 0 && balanceTable.profitOtherPaid){
                       logDesc = `New Balance,  ${investors.nickname} was paid ${balanceTable.deposit} as Annual Profit to account.` 
                }else if(balanceTable.withdraw > 0 ){
                    logDesc = `New Balance,  ${investors.nickname} took out ${balanceTable.deposit} as withdrawal from account.` 
                }else if(balanceTable.deposit>0){
                    logDesc = `New Balance,  ${investors.nickname} was paid ${balanceTable.deposit} as normal deposit to account.` 
                }


                global.saveLogs({
                    logType:'Balance',
                    investorName:investors.nickname,
                    description:logDesc,
                })

                return resolve({
                    err: false,
                    balances: balanceTable
                });
            }
            return reject({
                err: true,
                message: "Unable to create balances!"
            })

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })
}