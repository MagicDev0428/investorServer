import express from "express";
import boundedRoute from "../bounded-route";
import { Factories, Middlewares, Errors, Lib } from "../../utils";
import { TemplateEngine } from "../../templates";
import { MAX_FILES_PER_REQUEST, DocumentTypes } from "../../constants";
import { FailServerError } from "../../utils/errors";

export const router = express.Router();
/**
 * @swagger
 *
 * /login:
 *   post:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */

// router.get('/', userLoggedIn,  boundedRoute(async (req, res) => {
//   const investors = await Factories.InvestorFactory.getInvestors();
//   res.respond({
//     investors
//   });
// }));

router.post(
  "/save",
  Middlewares.checkAdminPrivileges,
  Middlewares.StorageMiddlewares.upload.array(
    "passportImages",
    MAX_FILES_PER_REQUEST
  ),
  Middlewares.RouteMiddlewares.createInvestor,
  boundedRoute(async (req, res) => {
    const {
      name,
      nickname,
      phone,
      email,
      address,
      postcode,
      city,
      country,
      status,
      facebook,
      passport,
      beneficiaryName,
      beneficiaryEmail,
      beneficiaryPhone,
      transferType,
      transferInfo,
      currency,
    } = req.body;
    const passportImages = req.files;

    const adminName = Lib.getAdminName(req.auth);

    // make sure email address doesnot exist in the db
    const investorByEmail = await Factories.InvestorFactory.findByEmail(email);
    if (investorByEmail) {
      throw new Errors.ResourceExistsError(
        `Email address: ${email} already exists.`
      );
    }

    // create the folders for the investor
    const client = Factories.getGoogleDriveInstance();
    const folderName = Lib.transformNameToPath(name);
    const { folderId, documentsFolderId, passportsFolderId } =
      await client.createFolders(folderName);

    // upload images if any
    const uploadPromises = passportImages.map(({ path, mimetype }) =>
      client.uploadFile(path, passportsFolderId, mimetype)
    );
    const passportImagesIds = await Promise.all(uploadPromises);

    // delete images from upload dir
    const deleteImagesPromises = passportImages.map(({ path }) =>
      Factories.PDFFactory.delete(path)
    );
    await Promise.all(deleteImagesPromises);

    const investor = await Factories.InvestorFactory.createInvestor({
      name,
      email,
      nickname,
      phone,
      address,
      postcode,
      city,
      country,
      status,
      folderId,
      documentsFolderId,
      passportsFolderId,
      passportImages: passportImagesIds,
      facebook,
      passport,
      beneficiaryName,
      beneficiaryEmail,
      beneficiaryPhone,
      transferType,
      transferInfo,
      currency,
      createdBy: adminName,
      modifiedBy: adminName,
    });

    if (!investor) {
      throw new FailServerError("Investor creation failed");
    }

    const investorId = investor._id;

    // create documents of type passport
    // const documetPromises = passportImages.map(({ filename: title }, index) => {
    //   const fileId = passportImagesIds[index];
    //   return Factories.DocumentFactory.createDocument({
    //     investorId,
    //     title,
    //     documentType: DocumentTypes.passport,
    //     fileId,
    //   });
    // });

    // await Promise.all(documetPromises);
    res.respondCreated({ investorId: investorId.toString() });
  })
);

// admins or an investor whoes auth0 email matches with the email in db with regards to investorId can call this endpoint
router.get(
  "/:investorId",
  Middlewares.checkInvestorPrivileges,
  Middlewares.RouteMiddlewares.getInvestor,
  boundedRoute(async (req, res) => {
    const investorId = req.params.investorId;
    const investorData = await Factories.InvestorFactory.getInvestor(
      investorId
    );

    if (Lib.isAdminOrLoggedInInvestor(req.auth, investorData.email) === false) {
      throw new Errors.ForbiddenError(
        "You are not authorized to access this endpoint"
      );
    }

    // remove folder ids
    const investor = {
      id: investorData.id,
      name: investorData.name,
      nickname: investorData.nickname,
      email: investorData.email,
      phone: investorData.phone,
      address: investorData.address,
      zipcode: investorData.zipcode,
      city: investorData.zipcode,
      country: investorData.country,
      status: investorData.status,
    };

    return res.respond({
      investor,
    });
  })
);

router.post(
  "/:investorId/email",
  Middlewares.RouteMiddlewares.sendDocument,
  boundedRoute(async (req, res) => {
    const { investorId } = req.params;
    const { documentId } = req.body;

    const investor = await Factories.InvestorFactory.getInvestor(investorId);
    const document = await Factories.DocumentFactory.getDocument(documentId);

    if (document.investorId !== investor.id) {
      throw new Errors.ValidationError(
        "Provided document doesnot belong to the investor"
      );
    }

    const emailHTML = await TemplateEngine({
      data: { name: investor.name },
      save: false,
      folder: "emails/invoice",
      template: "invoice",
    }).create();
    const pdfStream = await Factories.getGoogleDriveInstance().getFileStream(
      document.fileId
    );
    const email = new Factories.DocumentEmail(
      investor.email,
      emailHTML,
      document.title,
      pdfStream
    );
    const messageId = await email.send();

    res.respond({ messageId });
  })
);
