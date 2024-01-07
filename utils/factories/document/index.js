import { PDFFactory } from '../pdf';
import { TemplateEngine } from '../../../templates';
import { formatDate, transformNameToPath } from '../../lib';
import { getGoogleDriveInstance } from '../google';

export class Document {
  // Function for Document class
  // Required parameter like this;
  // document type is just like which type of this document for?
  // template is the name of folder where liquid folder is placed
  constructor(data, template, investorName = '', documentType, type = 'documents') {
    this.name = investorName;
    this.data = data;
    this.template = template;
    this.type = type;
    this.save = true;
    this.path = undefined;
    this.fileId = undefined;
    this.documentType = documentType;
  }

  /* create a PDF document by using the liquid template and render the html and store it at the path */
  async create() {
    
    const name = this.name && this.name.length > 0 ? `${formatDate(new Date(Date.now()))} ${(this.documentType + ' For ' + this.name)}` : this.name;
    
    // Create Template Engine object and pass the local file stored path
    const result = 
    this.path = await TemplateEngine({ 
      data: this.data, folder: `${this.type}/${this.template}`, template: this.template, save: this.save 
    }).create(name);

    
    if (this.save) {
      this.path = result;
    }

    return result;
  }

  // Save PDF function at google drive folder ID
  async savePDF(folderId) {
    if (this.path === undefined) {
      throw new Error('No template found. Call create function first to create a template.');
    }
    await PDFFactory.create(this.path);
    const pdfPath = this.path.replace('.html', '.pdf');
    // Upload PDF file to google drive folder id
    this.fileId = await getGoogleDriveInstance().uploadFile(pdfPath, folderId);

    await PDFFactory.delete(this.path);
    await PDFFactory.delete(pdfPath);

    return this.fileId;
  }

};