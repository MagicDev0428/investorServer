const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
import googleDriveConfig from '../../../investor-405618-2d4ac291108c.json';
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
      const investorFolderId = await createFolder(drive, rootFolderName, process.env.GOOGLE_DRIVE_ROOT);
      if (investorFolderId) {
        const documentsFolder = await createFolder(drive, 'Documents', investorFolderId);
        if (documentsFolder) {
          // All folders has been created
          return { folderId: investorFolderId, documentsFolderId: documentsFolder };
        }
      }      
    },
  };
};

function getGoogleDriveInstance () {
  if (!instance) {
    instance = GoogleDriveFactory(googleDriveConfig);
  }
  return instance;
};

export default getGoogleDriveInstance;