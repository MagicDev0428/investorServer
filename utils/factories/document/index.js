import { PDFFactory } from '../pdf';
import { TemplateEngine } from '../../../templates';
import { formatDate, transformNameToPath } from '../../lib';
import { getGoogleDriveInstance } from '../google';

export class Document {
  constructor(investorName, data, type = 'documents', template) {
    this.name = `${formatDate(new Date(Date.now()))}-${transformNameToPath(investorName)}`;
    this.data = data;
    this.template = template;
    this.type = type;
    this.path = undefined;
    this.fileId = undefined;
  }

  /* create a document by using the liquid template and render the html and store it at the path */
  async create() {
    this.path = await TemplateEngine({ data: this.data, folder: `${this.type}/${this.template}`, template: this.template }).create(this.name);
    return this.path;
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