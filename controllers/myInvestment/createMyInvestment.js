//
// Create Investment
//

import { Models } from '../../models';
import { Lib } from '../../utils';
// creating Investment table model
let myInvestmentTable = Models.myInvestmentsModel
const {getInvestorNickName} = require("../investor/getInvestor")
const factory = require("../../utils/factories/google");
//
// Create NEW investment with the data from the form
//

export const createInvestment = (req) => {
  global.show("###### investmentCreate ######");
  let received = req ? req.body : null;
  
  console.log(req.body);

  return new Promise(async (resolve, reject) => {

    try{
        // Checking if investor body is empty or not
        if (!received) {
            return reject({
                err: true,
                message: "my investment form is empty!",
            });
        }
 

            // checking id exists in myInvestments
            const investmentExists = await Models.investmentModel.exists({
                _id: received.investmentNo
            });
            if (!investmentExists) {
                return reject({
                    status: 403,
                    err: true,
                    message: "Investment No does not exist!",
                });
            }
            // checking id exists in myInvestments
            const investorFolders = await Models.Investor.findOne(
                    { _id: received.investorName },
                    'folders'
                );
            if (!investorFolders) {
                return reject({
                    status: 403,
                    err: true,
                    message: "Investor id does not exist!",
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

    const client = factory.getGoogleDriveInstance();

    const recieptFolderId = investorFolders.folders.recieptFolderId;
    const documentFolderId = investorFolders.folders.documentsFolderId;
    let attachmentResponse = {
      receipts: [],
      contracts: []
    };
    try {
        
    async function prepareAttachmentResponse(imagePath, documentType, parentFolderId) {
        let fileId = await client.uploadFile("uploads/" + imagePath, parentFolderId);
        // Get weblink of file
        let webLink = await client.getWebLink(fileId.id);
            if (fileId) {
              attachmentResponse[documentType].push({
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
            await prepareAttachmentResponse(imagePath, 'receipts', recieptFolderId)
          }
        } else {
          await prepareAttachmentResponse(received.receipt, 'receipts', recieptFolderId)         
        }      
      } 

      // Upload documents
      if(received.contract) {        
        if(Array.isArray(received.contract)) {
          for (const imagePath of received?.contract) {
            await prepareAttachmentResponse(imagePath, 'contracts', documentFolderId)
          }
        } else {
          await prepareAttachmentResponse(received.contract, 'contracts', documentFolderId);
        }    
      } 

      received.documents = attachmentResponse;
    } catch (error) {
        return reject({err:true,message: error});
    }

    
        const newMyInvestment = new Models.myInvestmentsModel(received);

        myInvestmentTable = null;
        myInvestmentTable = await newMyInvestment.save();

     

        if (myInvestmentTable){

            let  {investors} = await getInvestorNickName(myInvestmentTable.investorName)

              // this is for investment profit logs 
            let investmentProfit = 0
            if(myInvestmentTable.investType =='Monthly Profit' ||myInvestmentTable.investType =='Mixed'  ){
                investmentProfit = myInvestmentTable.profitMonthlyPct
            }else if(myInvestmentTable.investType =='Annual Profit' || myInvestmentTable.investType =='One-time Profit'){
                investmentProfit = myInvestmentTable.profitAnnualPct
            } 
            // save log for create my investment
            global.saveLogs({
                logType:'MY Investment',
                investorName:investors.nickname,
                investmentNo:myInvestmentTable.investmentNo,
                description:`New My Investment, ${investors.nickname} invested ฿${myInvestmentTable.amountInvested.toLocaleString()} in #${myInvestmentTable.investmentNo} at ${investmentProfit}%`,
            })
            
             return resolve({ status: 201, err: false, myInvestments: myInvestmentTable });
        }
        return reject({
        status: 500,
        err: true,
        message: "Error in my investment creation!",
        });
     } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
