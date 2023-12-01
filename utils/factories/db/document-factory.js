import { Document } from "./models";
import { boundedAsyncHandler } from '../../errors';

const asyncHandler = boundedAsyncHandler({ type: 'Document', message: 'Could not perform desired document operation!' });

export const DocumentFactory = {
  createDocument: asyncHandler(async () => {
    const document = await Document.create({  });
    return document;
  }),
  getDocuments: asyncHandler(async () => {
    const documents = await Document.find();
    return documents;
  }),
};