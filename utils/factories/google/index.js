import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import googleDriveConfig from '../../../google-client-config.json';
import { FailServerError } from '../../errors';

let instance = null;
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const GoogleDriveFactory = config => {
  const authorize = async () => {
    try {
      const client = new google.auth.JWT(config.client_email, null, config.private_key, SCOPES);
      await client.authorize();
      return client;      
    } catch (error) {
      console.log(error);
      throw new FailServerError('Google Drive client authorization failed');
    }
  };

  const createFolder = async (drive, folderName, parentFolderId = null) => {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] })
    };
    try {
      const response = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });      
      return response.data.id;
    } catch (error) {
      throw new FailServerError('Google Drive investor folder creation failed');
    }
  };

  return {
    createFolders: async rootFolderName => {
      const auth = await authorize();
      const drive = google.drive({ version: 'v3', auth });   
      try {
        const investorFolderId = await createFolder(drive, rootFolderName, process.env.GOOGLE_DRIVE_ROOT);
        if (investorFolderId) {
          const documentsFolder = await createFolder(drive, 'Documents', investorFolderId);
          const passportsFolder = await createFolder(drive, 'Passports', investorFolderId);
          if (documentsFolder && passportsFolder) {
            // All folders has been created
            return { folderId: investorFolderId, documentsFolderId: documentsFolder, passportsFolderId: passportsFolder };
          }
        }      
        
      } catch (error) {
        console.log(error)
      }   
    },
    uploadFile: async (filePath, folderId, mimeType = 'application/pdf') => {
      const auth = await authorize();
      const drive = google.drive({ version: 'v3', auth });
      
      const fileMetadata = {
        resource: {
          parents: [folderId],
          name: path.basename(filePath),
        },
        media: {
          mimeType,
          body: fs.createReadStream(filePath)
        },
        fields: 'id',        
      };

      try {
        const response = await drive.files.create(fileMetadata);
        return response.data.id;
      } catch (error) {
        throw new FailServerError('Google Drive invoice upload failed');
      }
    },
    getFileStream: async fileId => {
      const auth = await authorize();
      const drive = google.drive({ version: 'v3', auth });
      const fileMetadata = { fileId, alt: 'media' };
      try {
        const response = await drive.files.get(fileMetadata, { responseType: 'stream' });
        return response.data;
      } catch (error) {
        console.log(error);
        throw new FailServerError('Google Drive invoice export failed');
      }
    },
  };
};

export function getGoogleDriveInstance () {
  if (!instance) {
    instance = GoogleDriveFactory(googleDriveConfig);
  }
  return instance;
};