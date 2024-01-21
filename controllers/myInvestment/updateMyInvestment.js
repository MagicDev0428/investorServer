//
// Update Investment
//
import {
    Models
} from "../../models";

import {
    Lib
} from "../../utils";
const {
    getInvestorNickName
} = require("../investor/getInvestor")
const factory = require("../../utils/factories/google");

// creating table model
let myInvestmentTable = Models.myInvestmentsModel;

//
// Update EXISTING my investment with the data from the form
//
export const updateMyInvestment = (req) => {
    global.show("###### my investment update ######");
    let received = req ? req.body : null;
    // if (received) global.show({
    //     received
    // });
    console.log(received)
    return new Promise(async (resolve, reject) => {

        try {
            // check recieved._id exists
            const myInvestmentExists = await Models.myInvestmentsModel.exists({
                _id: received?._id,
            });

            if (!myInvestmentExists) {
                return reject({
                    status: 403,
                    err: true,
                    message: `myInvestment id ${received._id} is not exist!`,
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
            const investorFolders = await Models.Investor.findOne({
                    _id: received.investorName
                },
                'folders'
            );
            if (!investorFolders) {
                return reject({
                    status: 403,
                    err: true,
                    message: "Investor id does not exist!",
                });
            }

            const dateTime = new Date().toISOString();
            received.modifiedDate = dateTime;
            // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.modifiedBy = userName ? userName : "";


            // Get the google drive client
            const client = factory.getGoogleDriveInstance();

            const recieptFolderId = investorFolders.folders.recieptFolderId;
            const documentFolderId = investorFolders.folders.documentsFolderId;

            let documents = received?.documents ? JSON.parse(received.documents):null;

            if(documents){
            // Delete file if user has deleted the saved file in google drive
            for (let item of documents.receipts) {
                // if image is deleted then delete from google drive
                if (!item.filePath) {
                    if (item.googleFileId) {
                        await client.deleteFile(item.googleFileId);
                    }
                }
            }
            for (let item of documents.contracts) {
                // if image is deleted then delete from google drive
                if (!item.filePath) {
                    if (item.googleFileId) {
                        await client.deleteFile(item.googleFileId);
                    }
                }
            }

            documents.receipts = documents.receipts.filter(item => item.filePath);
            documents.contracts = documents.contracts.filter(item => item.filePath);
        }else{
            documents = {
                receipts: [],
                contracts: []
            };
        }

            async function prepareAttachmentResponse(imagePath, documentType, parentFolderId) {
                let fileId = await client.uploadFile("uploads/" + imagePath, parentFolderId);
                // Get weblink of file
                let webLink = await client.getWebLink(fileId.id);
                if (fileId) {
                    documents[documentType].push({
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
                        await prepareAttachmentResponse(imagePath, 'receipts', recieptFolderId)
                    }
                } else {
                    await prepareAttachmentResponse(received.receipt, 'receipts', recieptFolderId)
                }
            }

            // Upload documents
            if (received.contract) {
                if (Array.isArray(received.contract)) {
                    for (const imagePath of received?.contract) {
                        await prepareAttachmentResponse(imagePath, 'contracts', documentFolderId)
                    }
                } else {
                    await prepareAttachmentResponse(received.contract, 'contracts', documentFolderId);
                }
            }

            received.documents = documents
            myInvestmentTable = null;

            myInvestmentTable = await Models.myInvestmentsModel.findByIdAndUpdate(received._id, received, {
                new: true,
            });


            if (myInvestmentTable) {


                let {
                    investors
                } = await getInvestorNickName(myInvestmentTable.investorName)

                // this is for investment profit logs 
                let investmentProfit = 0
                if (myInvestmentTable.investType == 'Monthly Profit' || myInvestmentTable.investType == 'Mixed') {
                    investmentProfit = myInvestmentTable.profitMonthlyPct
                } else if (myInvestmentTable.investType == 'Annual Profit' || myInvestmentTable.investType == 'One-time Profit') {
                    investmentProfit = myInvestmentTable.profitAnnualPct
                }
                // save log for create my investment
                global.saveLogs({
                    logType: 'MY Investment',
                    investorName: investors.nickname,
                    investmentNo: myInvestmentTable.investmentNo,
                    description: `Updated My Investment, ${investors.nickname} invested ฿${myInvestmentTable.amountInvested.toLocaleString()} in #${myInvestmentTable.investmentNo} at ${investmentProfit}%`,
                })

                return resolve({
                    status: 200,
                    err: false,
                    myInvestments: myInvestmentTable
                });
            }
            return reject({
                status: 404,
                err: true,
                message: `Investment ${_id} Not Found!`,
            });

        } catch (error) {
            return reject({
                status: 500,
                err: true,
                message: error.message
            })
        }
    });
};