import { google } from "googleapis";
import fs from "fs";
import path from "path";
import googleDriveConfig from "../../../google-client-config.json";
import { FailServerError } from "../../errors";

let instance = null;
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const GoogleDriveFactory = (config) => {
  const authorize = async () => {
    try {
      const client = new google.auth.JWT(
        config.client_email,
        null,
        config.private_key,
        SCOPES
      );
      await client.authorize();
      return client;
    } catch (error) {
      console.log(error);
      throw new FailServerError("Google Drive client authorization failed");
    }
  };

  // Create folder
  // Google drive api https://developers.google.com/drive/api/guides/folder
  //
  const createFolder = async (drive, folderName, parentFolderId = null) => {
    // File meta data
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentFolderId && {
        parents: [parentFolderId],
      }),
    };
    try {
      // Actual call of google drive for create folder
      const response = await drive.files.create({
        resource: fileMetadata,
        fields: "id",
      });
      return response.data;
    } catch (error) {
      throw new FailServerError("Google Drive folder creation failed");
    }
  };

  return {
    // Create folder just pass the folder names
    // createFolders("Parent Folder", "Child Folder") or client.createFolders(null, "Parent Folder")
    createFolders: async (parentFolderId = null, childFolder) => {
      // Authorize the token, is this user the valid user or not??
      const auth = await authorize();
      const drive = google.drive({
        version: "v3",
        auth,
      });
      try {
        // If parentFolder is present then create parent folder at root and child folder under the parent.
        if (parentFolderId) {
          const folderId = await createFolder(drive, childFolder, parentFolderId);          
          if (folderId) {
            return folderId;
          }
        }

        //
        // If user wants to create only child folder at specific location
        //
        if (parentFolderId === null) {
          // Get all the folders list in root level
          let listFolders = await instance.listFolders();

          let listFolderNames = listFolders.map((item) => item.name);
          // check if the parentFolder is already exists, if yes then send the message
          if (listFolderNames.includes(childFolder)) {
            return {
              msg: `${childFolder} already exists.`,
            };
          }

          const childFolderId = await createFolder(
            drive,
            childFolder,
            process.env.GOOGLE_DRIVE_ROOT
          );

          if (childFolderId) {
            // All folders has been created
            return childFolderId;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    // Upload file
    // Arguments: "uploads/<file>", "FolderID where you want to upload the file"
    uploadFile: async (filePath, folderId) => {

      const auth = await authorize();
      const drive = google.drive({
        version: "v3",
        auth,
      });

      const fileMetadata = {
        resource: {
          parents: [folderId],
          name: path.basename(filePath),
        },
        media: {
         // mimeType,
          body: fs.createReadStream(filePath),
        },
        fields: "id",
      };

      try {
        const response = await drive.files.create(fileMetadata);
        return response.data;
      } catch (error) {
        throw new FailServerError("Google Drive invoice upload failed");
      }
    },
    getFileStream: async (fileId) => {
      const auth = await authorize();
      const drive = google.drive({
        version: "v3",
        auth,
      });
      const fileMetadata = {
        fileId,
        alt: "media",
      };
      try {
        const response = await drive.files.get(fileMetadata, {
          responseType: "stream",
        });
        return response.data;
      } catch (error) {
        console.log(error);
        throw new FailServerError("Google Drive invoice export failed");
      }
    },
    // Get the list of all folders in root level
    listFolders: async () => {
      try {
        // Authorize the user for token
        const auth = await authorize();
        const drive = google.drive({
          version: "v3",
          auth,
        });

        // Google drive api for list of files
        const response = await drive.files.list({
          q: `'${process.env.GOOGLE_DRIVE_ROOT}' in parents`, // query for the root folder
          fields: "files(id, name)", // get id and name for the folders
        });

        return response.data.files;
      } catch (error) {
        console.error("The API returned an error:", error);
        return undefined; // for error handling on the caller side, undefined means api was unsuccessful
      }
    },
    get: async (fileId) => {
      const auth = await authorize();
      const drive = google.drive({
        version: "v3",
        auth,
      });
      try {
        const response = await drive.files.get({
          fileId: fileId,
          fields: "id, name, mimeType",
        });

        return response.data;
      } catch (error) {
        console.error("Error fetching file:", error.message);
        throw new Error("Error fetching file");
      }
    },
    // Delete folder by folderId
    async deleteFolder(fileId) {
      // Authorize user
      const auth = await authorize();
      // Get the goolge drive API instance
      const drive = google.drive({
        version: "v3",
        auth,
      });
      // Actual Delete call with google API
      try {
        const response = await drive.files.update({
          fileId: fileId,
          requestBody: {
            trashed: true,
          },
        });
        return response;
      } catch (error) {
        console.error("Error deleting folder:", error.message);
        throw new Error("Error deleting folder:");
      }
    },
    // Rename folder by folderId
    async renameFolder(fileId, newName) {
      // Authorize user
      const auth = await authorize();
      // Get the goolge drive API instance
      const drive = google.drive({
        version: "v3",
        auth,
      });
      // Actual Update folder call with google API
      try {
        const response = await drive.files.update({
          fileId: fileId,
          requestBody: {
            name: newName,
          },
        });
        return response.data.id;
      } catch (error) {
        console.error("Error update rename folder:", error.message);
        throw new Error("Error update rename folder:");
      }
    },
    // Delete File by fileId
    async deleteFile(fileId) {
      // Authorize user
      const auth = await authorize();
      // Get the goolge drive API instance
      const drive = google.drive({
        version: "v3",
        auth,
      });
      // Actual Delete call with google API
      try {
        const response = await drive.files.delete({
          fileId: fileId
        });
        return response;
      } catch (error) {
        console.error("Error deleting file:", error.message);
        throw new Error("Error deleting file:");
      }
    },
    // Get the web link
    async getWebLink(fileId) {
      // Authorize user
      const auth = await authorize();
      // Get the goolge drive API instance
      const drive = google.drive({
        version: "v3",
        auth,
      });
       // get web link 
       try {
        // First give reader permission to anyone
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          }
        });
        // get the webViewLink
        const response = await drive.files.get({
          fileId: fileId,
          fields: 'webViewLink'
      })
        return response.data.webViewLink;
      } catch (error) {
        console.error("Error while getting the weblink of file:", error.message);
        throw new Error("Error while getting the weblink of file:");
      }
    }
  };
};

export function getGoogleDriveInstance() {
  if (!instance) {
    instance = GoogleDriveFactory(googleDriveConfig);
  }
  return instance;
}
