import { Liquid } from 'liquidjs';
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { FailServerError } from '../../errors';

const createInvoice = params => {
  const _path = path.join(__dirname, '../../../');
  const engine = new Liquid({
    root: _path + '/templates/invoice', // Specify the root directory of templates
    extname: '.liquid' // Specify the extension of your templates
  });

  return new Promise((resolve, reject) => {
    engine.renderFile('invoice', params)
      .then(async html => {
        const fileName = `${Date.now()}.html`;
        const _renderPath = path.join(_path, `/render/${fileName}`);
        await fs.writeFile(_renderPath, html);
        resolve(_renderPath);
      })
      .catch(err => {
        console.log(err);
        reject(undefined);
      });

  });
};

const htmlToPdf = async html =>  {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${html}`);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  const pdfPath = html.replace('html', 'pdf');
  await fs.writeFile(pdfPath, pdf);
  return pdfPath;
};

export const InvoiceFactory = {
  create: async params => {
    const htmlPath = await createInvoice(params);

    if (!htmlPath) {
      throw new FailServerError('Inovice template could not be renderd');
    }

    try {
      const pdfPath = await htmlToPdf(htmlPath);
      return pdfPath;
    } catch (error) {
      console.log(error);
      throw new FailServerError('Inovice PDF could not be created');
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

