import { Liquid } from 'liquidjs';
import path from 'path';
import fs from 'fs/promises';

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
  const create = () => {
    const _path = path.join(__dirname, `${folder}`);
    
    const engine = new Liquid({
      root: _path, // Specify the root directory of templates
      extname: '.liquid' // Specify the extension of your templates
    });
  
    return new Promise((resolve, reject) => {
      engine.renderFile(template, data)
        .then(async html => {
          if (save) {
            const fileName = `${Date.now()}.html`;
            const _renderPath = path.join(__dirname, `../render/${fileName}`);
            await fs.writeFile(_renderPath, html);
            return resolve(_renderPath);
          }
          resolve(html);
        })
        .catch(err => {
          console.log(err);
          reject(undefined);
        });  
    });
  };

  return {
    create
  }
};