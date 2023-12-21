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
    // createFolders("Parent Folder", "Child Folder") or client.createFolders("Parent Folder")
    createFolders: async (parentFolderId = null, childFolder) => {
      // Authorize the token, is this user the valid user or not??
      const auth = await authorize();
      const drive = google.drive({
        version: "v3",
        auth,
      });
      try {
        // If parentFolder is not present in the root then only create it
        //const rootFolderId = await createFolder(drive, childFolder, process.env.GOOGLE_DRIVE_ROOT);
        if (parentFolderId) {
          const folderId = await createFolder(
            drive,
            childFolder,
            parentFolderId
          );

          // If user don't want to create child folder only one folder i.e parent folder
          if (folderId) {
            return folderId;
          }
        }

        //
        // If user wants to create child and parent both folder then create child folder
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
    uploadFile: async (filePath, folderId, mimeType = "application/pdf") => {
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
          mimeType,
          body: fs.createReadStream(filePath),
        },
        fields: "id",
      };

      try {
        const response = await drive.files.create(fileMetadata);
        return response.data.id;
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
      const response = await drive.files.update({
        fileId: fileId,
        requestBody: {
          trashed: true,
        },
      });
      return response;
    },
  };
};

export function getGoogleDriveInstance() {
  if (!instance) {
    instance = GoogleDriveFactory(googleDriveConfig);
  }
  return instance;
}
