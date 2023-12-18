// import express from 'express';
// import boundedRoute from '../bounded-route';
// import { Factories, Lib, Middlewares } from '../../utils';
// import { NotFoundError } from '../../utils/errors';
// import { TemplateEngine } from '../../templates';
// import { SampleInvoice } from '../../constants';

// export const router = express.Router();

// router.get('/', boundedRoute(async (req, res) => {
//   const documents = await Factories.DocumentFactory.getDocuments();
//   res.respond({
//     documents
//   });  
// }));

// router.post('/', Middlewares.RouteMiddlewares.createDocument, boundedRoute(async (req, res) => {
//   const { investorId, documentType } = req.body;
  
//   const investor = await Factories.InvestorFactory.getInvestor(investorId);
//   if (investor === undefined) {
//     throw new NotFoundError('Investor not found');
//   }

//   const documentName = `${Lib.formatDate(new Date(Date.now()))}-${Lib.transformNameToPath(investor.name)}`;
//   const data = {
//     ...SampleInvoice,
//     investor: {
//       company_name: investor.name,
//       name: investor.name,
//       email: investor.email
//     },
//   }
//   const documentPath = await TemplateEngine({ data, folder: `documents/${documentType}`, template: documentType }).create(documentName);
//   const pdfPath = await Factories.PDFFactory.create(documentPath);
//   const fileId = await Factories.getGoogleDriveInstance().uploadFile(pdfPath, investor.documentsFolderId);

//   const document = await Factories.DocumentFactory.createDocument({
//     investorId, title: `${documentName}.pdf`, documentType, fileId
//   });

//   // delete the temp files
//   await Factories.PDFFactory.delete(pdfPath.replace('.pdf', '.html'));
//   await Factories.PDFFactory.delete(pdfPath);

//   res.respond({ documentId: document._id });
// }));