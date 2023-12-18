import { Liquid } from 'liquidjs';
import path from 'path';
import fs from 'fs/promises';
import { FailServerError } from '../utils/errors';

/**
 * 
 * @param {object} data Object with values to be passed to the rendered template
 * @param {boolean} save true to be saved in render folder or false
 * @param {string} folder Path to the folder where template is located relative to /templates folder e.g emails/invoice
 * @param {string} template Name of the template
 * 
 * @returns {string | undefined} Path to the rendered file or html
 */
export const TemplateEngine = ({ data, save = true, folder, template }) => {
  const create = fileName => {
    const _path = path.join(__dirname, `${folder}`);
    
    const engine = new Liquid({
      root: _path, // Specify the root directory of templates
      extname: '.liquid' // Specify the extension of your templates
    });
  
    return new Promise(resolve => {
      engine.renderFile(template, data)
        .then(async html => {
          if (save) {
            // when save is true, write the file to the disk
            fileName = (fileName === undefined || fileName.length === 0) ? `${Date.now()}.html` : `${fileName}.html`;
            const _renderPath = path.join(__dirname, `../render/${fileName}`);
            await fs.writeFile(_renderPath, html);
            return resolve(_renderPath);
          }
          // otherwise just return the rendered html
          resolve(html);
        })
        .catch(err => {
          console.log(err);
          throw new FailServerError('Unable to create html template of the document');
        });  
    });
  };

  return {
    create
  }
};