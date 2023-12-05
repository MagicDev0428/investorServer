import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { FailServerError } from '../../errors';

export const PDFFactory = {
  create: async html => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`file://${html}`);
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();
      const pdfPath = html.replace('html', 'pdf');
      await fs.writeFile(pdfPath, pdf);
      return pdfPath;
    } catch (error) {
      throw new FailServerError('Unable to create pdf of the document');
    }
  },
  delete: async path => {
    try {
      await fs.unlink(path);      
    } catch (error) {
      console.log(error, 'failing silently');
    }
  }
};

