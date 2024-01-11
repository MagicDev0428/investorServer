//
// Create Investor
//

import { Models } from '../../models';
import { Lib } from '../../utils';
const validator = require("validator"); 
const factory = require("../../utils/factories/google");
import * as CONSTANT from "../../constants";


// creating investor table model
let investorTable = Models.Investor



exports.investorCreate = async (req) => {
  global.show("###### investorCreate ######");
  const received = req ? req.body : null;
  console.log(req.body);
  //if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    try{
    // Checking if investor body is empty or not
    if (!received) {
      return reject({
        err: true,
        message: "Investor form is empty!",
      });
    }

    // Checking if user id and nickname are provided
    if (!received._id || !received.nickname) {
      return reject({
        err: true,
        message: "Id and nickname are required!",
      });
    }

    // Validating email
    if (
      (received?.email && !validator.isEmail(received?.email)) ||
      (received?.beneficiaryEmail &&
        !validator.isEmail(received?.beneficiaryEmail))
    ) {
      return reject({
        err: true,
        message: "Invalid Email or beneficiaryEmail address!",
      });
    }

    // Check if the investor already exists
    const existingInvestor = await Models.Investor.findOne({
      _id: received._id,
    });
    if (existingInvestor) {
      return reject({
        err: true,
        message: `Investor with ${received._id} already exists!`,
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

    // create folder in google drive
    // Get the google drive client 
    const client = factory.getGoogleDriveInstance();
    // use google drive client for list of folders
    const folders = await client.listFolders();
    // Find the folderId which folder you want to create the folder
    let filteredFolder = folders.find(folder => folder.name === received._id);
    let passportFolderId;
    let investorFolderId;
    let balanceSheetFolderId, documentsFolderId, recieptFolderId, depositFolderId, withdrawFolderId, investFolderId;
    let uploadResponse = [];
    // If user has already folder created with the name
    try {
      if(filteredFolder) {
        // Upload the file 
        investorFolderId = filteredFolder.id;
      } else {
        // If folder is not created then first create folder
        // create only 1 folder at root level
        let res = await client.createFolders(null, received._id);
        investorFolderId = res.id;
      }
      
      // create only 1 folder at root level
      // create folder and get folder Id
      passportFolderId = await client.createFolders(investorFolderId, CONSTANT.PASSPORTS);
      balanceSheetFolderId = await client.createFolders(investorFolderId, CONSTANT.BALANCE_SHEET);
      documentsFolderId = await client.createFolders(investorFolderId, CONSTANT.DOCUMENTS);
      recieptFolderId = await client.createFolders(investorFolderId, CONSTANT.RECIETPTS);
      depositFolderId = await client.createFolders(recieptFolderId, CONSTANT.DEPOSIT);
      withdrawFolderId = await client.createFolders(recieptFolderId, CONSTANT.WITHDRAW);
      investFolderId = await client.createFolders(recieptFolderId, CONSTANT.INVEST);

      passportFolderId = passportFolderId.id;
      balanceSheetFolderId = balanceSheetFolderId.id;
      documentsFolderId = documentsFolderId.id;
      recieptFolderId = recieptFolderId.id;
      depositFolderId = depositFolderId.id;
      withdrawFolderId = withdrawFolderId.id;
      investFolderId = investFolderId.id;

      if(received.passportImage ) {
        if(Array.isArray(received.passportImage)) {
          for (const imagePath of received?.passportImage) {
            let fileId = await client.uploadFile(
              "uploads/" + imagePath,
              passportFolderId
            );
            // Get weblink of file
            let webLink = await client.getWebLink(fileId.id);
            if (fileId) {
              uploadResponse.push({
                image: imagePath,
                googleFileId: fileId.id,
                passportFolderId: passportFolderId,
                webLink: webLink
              });
              // Delete this uploaded file in server
              Lib.deleteFile("uploads/" + imagePath);
            }
          }
        } else {
          let fileId = await client.uploadFile("uploads/" + received.passportImage, passportFolderId); 
          // Get weblink of file
          let webLink = await client.getWebLink(fileId.id);       
            if(fileId) {
              uploadResponse.push({
                image: received.passportImage,
                googleFileId: fileId.id,
                passportFolderId: passportFolderId,
                webLink: webLink
              })
              // Delete this uploaded file in server
              Lib.deleteFile("uploads/" + received.passportImage);
            }
        }      
      } 
      // Keep default uploadResponse that what is the passport folder id
      uploadResponse.push({
        readonly: true, // Never delete this object
        image: null,
        googleFileId: null,
        passportFolderId: passportFolderId,
        balanceSheetFolderId: balanceSheetFolderId,
        documentsFolderId: documentsFolderId,
        recieptFolderId: recieptFolderId,
        depositFolderId: depositFolderId,
        withdrawFolderId: withdrawFolderId,
        investFolderId: investFolderId,
        webLink: null
      });
    } catch(ex) {
      console.error(ex);
      return reject({err:true,message: ex});
    }

    received.folders = uploadResponse;
    received.investorFolderId = investorFolderId;

    if(!received.pincode){
      // Adding pin to the received object
      received.pincode = Lib.pingenerator();
    }

 


    // Creating a new investor instance
    const newInvestor = new  Models.Investor(received);

    // Saving investor data in the collection
    investorTable = null;
    investorTable = await newInvestor.save();
    if (investorTable) {
    // save log for to create investor 
    global.saveLogs({
        logType:'INVESTOR',
        investorName:investorTable._id,
        description:`New Investor ${investorTable._id}  ${investorTable.nickname} from ${investorTable.country}.`,
    })

      return resolve({ err: false, investors: investorTable });
    }
    return reject({ err: true, message: "Error in investor creation!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

