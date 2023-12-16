// import { Models } from '../../../models';
// import { boundedAsyncHandler } from '../../errors';

// const asyncHandler = boundedAsyncHandler({ type: 'Document', message: 'Could not perform desired document operation!' });

// export const DocumentFactory = {
//   createDocument: asyncHandler(async ({ investorId, title, documentType, fileId }) => {
//     const document = await Models.Document.create({ 
//       title, documentType, fileId, investor: investorId
//     });
//     return document;
//   }),
//   getDocuments: asyncHandler(async () => {
//     const documents = await Models.Document.find();
//     return documents;
//   }),
//   getDocument: asyncHandler(async documentId => {
//     const documentData = await Models.Document.findById(documentId);
//     if (documentData) {
//       const document = {
//         id: documentData._id.toString(),
//         documentType: documentData.documentType,
//         fileId: documentData.fileId,
//         title: documentData.title,
//         investorId: documentData.investor.toString()
//       };
//       return document;
//     }
//     return undefined;
//   }),
// };