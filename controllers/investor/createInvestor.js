//
// Create Investor
//

import { Models } from '../../models';
import { Lib } from '../../utils';
const validator = require("validator"); 
const path = require('path');
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

 
    const emailExist = await Models.Investor.exists({email:received.email});
    if (emailExist) {
      return reject({
        err: true,
        message: `Investor with email ${received.email} already exist, please change email!`,
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
    let passportFolder;
    let investorFolderId;
    let balanceSheetFolder, documentsFolder, recieptFolder, depositFolder, withdrawFolder, investFolder;
    let attachmentResponse = {
      passportImages: [],
      documents: []
    };
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
      passportFolder = await client.createFolders(investorFolderId, CONSTANT.PASSPORTS);
      balanceSheetFolder = await client.createFolders(investorFolderId, CONSTANT.BALANCE_SHEET);
      documentsFolder = await client.createFolders(investorFolderId, CONSTANT.DOCUMENTS);
      recieptFolder = await client.createFolders(investorFolderId, CONSTANT.RECIETPTS);
      depositFolder = await client.createFolders(recieptFolder, CONSTANT.DEPOSIT);
      withdrawFolder = await client.createFolders(recieptFolder, CONSTANT.WITHDRAW);
      investFolder = await client.createFolders(recieptFolder, CONSTANT.INVEST);

      received.folders = {
        'investorFolderId': investorFolderId,
        'passportFolderId': passportFolder.id,
        'balanceSheetFolderId': balanceSheetFolder.id,
        'documentsFolderId': documentsFolder.id,
        'recieptFolderId': recieptFolder.id,
        'depositFolderId': depositFolder.id,
        'withdrawFolderId': withdrawFolder.id,
        'investFolderId': investFolder.id
      };

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
      if(received.passportImage ) {
        if(Array.isArray(received.passportImage)) {
          for (const imagePath of received?.passportImage) {
            await prepareAttachmentResponse(imagePath, 'passportImages', passportFolder.id)
          }
        } else {
          await prepareAttachmentResponse(received.passportImage, 'passportImages', passportFolder.id)         
        }      
      } 

      // Upload documents
      if(received.documents) {        
        if(Array.isArray(received.document)) {
          for (const imagePath of received?.document) {
            await prepareAttachmentResponse(imagePath, 'documents', documentsFolder.id)
          }
        } else {
          await prepareAttachmentResponse(received.document, 'documents', documentsFolder.id);
        }    
      } 
      // Keep default attachmentResponse that what is the passport folder id
      // attachmentResponse.push({
      //   readonly: true, // Never delete this object
      //   image: null,
      //   documents: null,
      //   googleDocumentFileId: null,
      //   googleFileId: null,
      //   passportFolder: passportFolder,
      //   balanceSheetFolder: balanceSheetFolder,
      //   documentsFolder: documentsFolder,
      //   recieptFolder: recieptFolder,
      //   depositFolder: depositFolder,
      //   withdrawFolder: withdrawFolder,
      //   investFolder: investFolder,
      //   webLink: null
      // });
      received.attachments = attachmentResponse;
    } catch(ex) {
      console.error(ex);
      return reject({err:true,message: ex});
    }

    
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

