import express from 'express';
import boundedRoute from '../bounded-route';
import { Factories, Middlewares, Errors, Lib } from '../../utils';
import { TemplateEngine } from '../../templates';

export const router = express.Router();

router.get('/', boundedRoute(async (req, res) => {
  const investors = await Factories.InvestorFactory.getInvestors();
  res.respond({
    investors
  });  
}));

/**
 * create a new investor
 */
router.post('/', Middlewares.RouteMiddlewares.createInvestor, boundedRoute(async (req, res) => {
  const { name, nickname, phone, email, address, zipcode, city, country } = req.body;
  
  // make sure email address doesnot exist in the db
  const investorByEmail = await Factories.InvestorFactory.findByEmail(email);
  if (investorByEmail) {
    throw new Errors.ResourceExistsError(`Email address: ${email} already exists.`);
  }

  // create the folders for the investor
  const client = Factories.getGoogleDriveInstance();
  const folderName = Lib.transformNameToPath(name);
  const { folderId, documentsFolderId, passportsFolderId } = await client.createFolders(folderName);

  const investor = await Factories.InvestorFactory.createInvestor({ 
    name, email, nickname, phone, address, zipcode, city, country, status: 'active', folderId, documentsFolderId, passportsFolderId
  });

  if (investor) {
    res.respondCreated({ investorId: investor._id.toString() });
  } else {
    res.fail('Investor creation failed');
  }

}));

router.get('/:investorId', Middlewares.RouteMiddlewares.getInvestor, boundedRoute(async (req, res) => {
  const investorId = req.params.investorId;
  const investorData = await Factories.InvestorFactory.getInvestor(investorId);
  
  // remove folder ids
  const investor = {
    id: investorData.id, name: investorData.name, nickname: investorData.nickname, email: investorData.email, phone: investorData.phone, 
    address: investorData.address, zipcode: investorData.zipcode, city: investorData.zipcode, country: investorData.country, 
    status: investorData.status
  };
  res.respond({
    investor
  });
  
}));

router.post('/:investorId/email', Middlewares.RouteMiddlewares.sendDocument, boundedRoute(async (req, res) => {
  const { investorId } = req.params;
  const { documentId } = req.body;

  const investor = await Factories.InvestorFactory.getInvestor(investorId);
  const document = await Factories.DocumentFactory.getDocument(documentId);

  if (document.investorId !== investor.id) {
    throw new Errors.ValidationError('Provided document doesnot belong to the investor');
  }

  const emailHTML = await TemplateEngine({ data: { name: investor.name }, save: false, folder: 'emails/invoice', template: 'invoice' }).create();
  const pdfStream = await Factories.getGoogleDriveInstance().getFileStream(document.fileId);
  const email = new Factories.DocumentEmail(investor.email, emailHTML, document.title, pdfStream);
  const messageId = await email.send();
  
  res.respond({ messageId });
}));