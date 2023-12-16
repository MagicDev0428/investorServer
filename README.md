# ServerInvestorSystem

## Create a document
`Document` class is exported as part of `Factories` and can be imported from in `/utils` now takes care of creating documents from now on. To create a document whether it be an invoice or business document or email, you will need this class.

First you need to have a template of the document. To do that you need to create a `.liquid` file in the `templates` folder. `templates` folder has different subfolders. Email templates will go in `emails` folder and any other document template should go in `documents` folder. Name the folder which represents the document and create a `.liquid` file with the same name in the newly created folder. For example, `invoice` is a document, so there is an `invoice` folder in `documents` folder and there is one template file `invoice.liquid` inside the `invoice` folder. 

The structure should look like this:
```bash
├── templates
│   ├── documents
│   │   ├── invoice
│   │   │   ├── invoice.liquid
```

Let say you want to create a new template for `balance-sheet`. You will first create a new folder `balance-sheet` in `documents` and create a `balance-sheet,liquid` file in the `balance-sheet` folder. The structure will look like this:
```bash
├── templates
│   ├── documents
│   │   ├── invoice
│   │   │   ├── invoice.liquid
│   │   ├── balance-sheet
│   │   │   ├── balance-sheet.liquid
```

Same goes for any email templates you want to create. The only difference here is that email folders will go in `emails` folder.

> [!WARNING]  
> The `documents` collection in db is not valid anymore. It has been removed. Now when you create a document and upload to google drive,
> you need to save the `fileId` returned in the investor object. If you don't, then you won't be able to access that document later and 
> won't be able to add as an attachment.


After creating the template file, you can now use `Document` class to make `html` or `pdf` documents.
```js
  /**
   * @param (data):     Object which has the key values which are used in the liquid file for 
   *                    variables.
   * @param (type):     documents | emails. Here it can be either documents or emails. It 
   *                    refers to the 
   *                    parent folder where template folder resides.
   * @param (template): Name of the template e.g invoice, balance-sheet etc.
   * @param (save):     Boolean, if true, the create function will return the path to the
   *                    saved file which will be then used to create pdf. If false, the 
   *                    create function will return the html.
   * @param (name):     A string value which will be part of the name of the file. It can be 
   *                    the name of the investor. It is better to provde the name when you
   *                    set save to true. Otherwise a random timestamp will be the name of 
   *                    the file.
   */
  const document = new Document(data, type, template, save, name);

  /**
   * create() function will render the template and then returns the absoulute path or html of 
   * the rendered document. 
   * All the rendered documents will temporarily reside in the render folder if save is true.
   */
  const path = await document.create();

  /**
   * @param (folderId): Google drive folder Id where you want to upload the rendered pdf 
   *                    document.
   * 
   * This function will use the template generated in create() function, converts it to
   * pdf and then uploads to the google drive. After that, it will remove the the 
   * temporary files in the render folder.
   */
  const fileId = await document.savePDF(folderId);
```

### Example
A complete example for creating an invoice. 
```js
  import { Factories } from './utils';

  const name = 'Ahsan Butt';
  const data = {
    name: 'Ahsan Butt',
    email: 'jsan+investor.test@gmail.com',
    company_name: 'XYZ LLC'
    // more data as needed by the liquid file of the invoice template
  };
  
  /* the template is in the documents folder */
  const type = 'documents';

  /* the acutual template folder name where liquid file is placed. */
  const template = 'invoice';
  
  /* the id of the documents folder which belongs the the investor Ahsan Butt */
  const folderId = '1xyz...';

  /* create the template file */
  const document = new Factories.Document(data, type, template, true, name);
  const path = await document.create();
  
  /* fileId is the id of the file on google drive. You need to save it to the */
  /* investor object in db. */
  const fileId = await document.savePDF(folderId);
```

## Send an Email
There is an `Email` class which can be used to send the emails. Email body can be of text or html. If both are provided, html will take precedence. If none is provided, the client will throw an error.

The `Email` class is exported as part of the `Factories` and can be imported from `utils`. The `emails` folder in `templates` folder will hold all different kinds of emails. The structure follows the same pattern as documents.

```js
  /**
   * @param (email): Email address where email needs to be sent.
   */
  const client = new Factories.Email(email);

  /* setSubject is used to set the subject of the email. */
  client.setSubject('This is a test email');

  /* setText to set the raw text as body of the email */
  client.setText('This is the body of the email. Right now it is text');

  /* setHtml to set the html as body of the email */
  client.setHtml('<html><p>This is html body</p></html>');

  /* attach function attaches the pdf files which are at the google drive */
  /* you need to provide the fileId, which should be saved in the investor model. */
  /* you can attach multiple documents like that. The attachment must be a pdf,  */
  /* otherwise you the client will throw an error. */
  await client.attach(fileIdA);
  await client.attach(fileIdB);

  /* when you have set everything, call send function to send the email. */
  await emailClient.send();
```

### Example
A complete example for sending an email using html as body.
```js
  import { Factories } from './utils';

  const name = 'Ahsan Butt';
  const data = {
    name: 'Ahsan Butt',
    // more data as needed by the liquid file of the template
  };
  
  /* the template is in the emails folder */
  /*  */
  const type = 'emails';

  /* the acutual template folder name where liquid file is placed. */
  const template = 'invoice';

  /* create the template file. Here save is false as we don't need to save the html. */
  /* name is also not required if we just need html and not create a file on the disk. */
  const document = new Factories.Document(data, type, template, false);
  const html = await document.create();

  /* create the email client and provide the email address of the recipient */
  const client = new Factories.Email(email);

  /* set subject and set the html which you just rendered */
  client.setSubject('Subject of the email');
  client.setHtml(html);

  /* attach the file which you want to send as an attachment */
  await client.attach(fileIdA);

  /* and send */
  await emailClient.send();
```

## Create folders for the investor
When you create an investor, you need to create folders for the investor on google drive where documents will be uploaded. There is one root folder of the project which is provided by the application. It can be found in the `.env.local` file. The variable name is `GOOGLE_DRIVE_ROOT`. This holds all the investor system folders which are created using the library.

### Create the folders for investor
`getGoogleDriveInstance()` is exported as part of the `Factories` and can be imported from `utils`. The returns an instance of google drive which is authenticated to access the google drive folder.

```js
  /* create the google drive client */
  const client = Factories.getGoogleDriveInstance();

  /**
   * @param (name): name of the investor which was sent with the request.
   * 
   * santize the name and remove spaces */
   */
  const folderName = Lib.transformNameToPath(name);
  
  /* create the folders and get the ids in return */
  /* folderId: this is the root folder of the investor where everything will reside */
  /* documentsFolderId: this is the document where pdfs will be uploaded */
  /* passportsFolderId: this folder can be used to upload passport images of the investor */
  const { 
    folderId, documentsFolderId, passportsFolderId 
  } = await client.createFolders(folderName);

  /* returns an array of all the folders already present on the google drive. It can be used to verify */
  /* if a folder name already exists or not */
  const list = await client.listFolders();
```

### Example
A complete example for creating folders when creating a new investor.

```js
  import { Factories } from './utils';

  const client = Factories.getGoogleDriveInstance();

  const folderName = Lib.transformNameToPath(name);

  const list = await client.listFolders();

  if (list.includes(folderName)) {
    throw new Error('Folder name already exists.');
  }

  /* if all good, create the folders */
  const { 
    folderId, documentsFolderId, passportsFolderId 
  } = await client.createFolders(folderName);

  // here you can save them along with your investor

```