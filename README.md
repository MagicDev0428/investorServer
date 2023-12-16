# ServerInvestorSystem

### Create a document
`Document` class in `/utils/factories/document/index.js` now takes care of creating documents from now on. To create a document whether it be an invoice or business document or email, you will need this class.

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

After creating the template file, you can now use `Document` class to make `html` or `pdf` documents.
```js
  /**
   * @param (name):     A string value which will be part of the name of the file. It can name of the investor.
   * @param (data):     Object which has the key values which are used in the liquid file for variables.
   * @param (type):     documents | emails. Here it can be either documents or emails. It refers to the 
   *                    parent folder where template folder resides.
   * @param (template): Name of the template e.g invoice, balance-sheet etc.
   */
  const document = new Document(name, data, type, template);

  /**
   * create() function will render the template and then returns the absoulute path of the rendered document. 
   * All the rendered documents will temporarily reside in the render folder. The path can be provided to the 
   * email function to send html emails.
   */
  const path = await document.create();

  /**
   * @param (folderId): Google drive folder Id where you want to upload the rendered pdf document.
   * 
   * This function will use the template generated in create() function, converts it to pdf and then 
   * uploads to the google drive. After that, it will remove the the temporary files in the render folder.
   */
  const fileId = await document.savePDF(folderId);
```

#### Example
A complete example for creating an invoice. 
```js
  const name = 'Ahsan Butt';
  const data = {
    name: 'Ahsan Butt',
    email: 'jsan+investor.test@gmail.com',
    company_name: 'XYZ LLC'
    // more data as needed by the liquid file of the invoice template
  };
  const type = 'documents';   // the template is in the documents folder
  const template = 'invoice'; // the acutual template folder name where liquid file is placed.
  const folderId = '1xyz...'; // the id of the documents folder which belongs the the investor Ahsan Butt

  /* create the template file */
  const document = new Document(name, data, type, template);
  const path = await document.create();
  
  /* fileId is the id of the file on google drive. You need to save it to the investor object in db. */
  const fileId = await document.savePDF(folderId);

  
```