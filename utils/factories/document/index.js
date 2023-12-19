import { PDFFactory } from '../pdf';
import { TemplateEngine } from '../../../templates';
import { formatDate, transformNameToPath } from '../../lib';
import { getGoogleDriveInstance } from '../google';

export class Document {
  constructor(data, type = 'documents', template, save = true, investorName = '') {
    this.name = investorName;
    this.data = data;
    this.template = template;
    this.type = type;
    this.save = save;
    this.path = undefined;
    this.fileId = undefined;
  }

  /* create a PDF document by using the liquid template and render the html and store it at the path */
  async create() {

    const name = this.name && this.name.length > 0 ? `${formatDate(new Date(Date.now()))}-${transformNameToPath(this.name)}` : this.name;
    const result = 
    this.path = await TemplateEngine({ 
      data: this.data, folder: `${this.type}/${this.template}`, template: this.template, save: this.save 
    }).create(name);

    if (this.save) {
      this.path = result;
    }

    return result;
  }

  async savePDF(folderId) {
    if (this.path === undefined) {
      throw new Error('No template found. Call create function first to create a template.');
    }
    await PDFFactory.create(this.path);
    const pdfPath = this.path.replace('.html', '.pdf');
    this.fileId = await getGoogleDriveInstance().uploadFile(pdfPath, folderId);

    await PDFFactory.delete(this.path);
    await PDFFactory.delete(pdfPath);

    return this.fileId;
  }

};