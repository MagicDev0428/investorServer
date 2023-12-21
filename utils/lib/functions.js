import moment from 'moment';
import { getGoogleDriveInstance } from '../factories/google';
import { AUTH0_NAMESPACE, ROLES } from '../../constants';
import { ServiceError } from '../errors';

export const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}-${hour}:${minutes}`;
};

export const  calculateDays = (startDate, endDate) =>{
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);
  return endMoment.diff(startMoment, 'days');


}

export const transformNameToPath = name => name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

export const pingenerator = () => {
  // Generating pin between 10 to 99
  const randomPin = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
  return `${randomPin}${randomPin}`;
};

/* auth0 embeds auth object in the req object. */
/* return true either the caller of the request is admin */
/* or the caller is the user himself and accessing his own data */
export const isAdminOrLoggedInInvestor = (auth, email) => {
  if (auth) {
    const namespace = auth[AUTH0_NAMESPACE];
    if (namespace.roles && (namespace.roles.includes(ROLES.admin) || namespace.email === email)) {
      return true    
    }
  }
  return false;
};

/* get the name of the admin from the token */
export const getAdminName = auth => auth[AUTH0_NAMESPACE].name;

/* check whether the name of the folder is taken. */
/* if taken, return true */
export const isInvestorFolderNameTaken = async name => {
  const client = getGoogleDriveInstance();
  try {
    const folderNames = await client.listFolders();
    /* error occured. notify the controller that the request is not serviceable at this point */
    if (folderNames === undefined) {
      throw new ServiceError('Google Drive service is unreachable. Please try again');
    }

    /* no folders exists in the google drive folder */
    if (folderNames.length === 0) {
      return false;
    }

    /* folder name alreay exists in the google drive */
    if (folderNames.includes(name)) {
      return true;
    }

  } catch (error) {
    console.log(error);
    throw new ServiceError('Error in isInvestorFolderNameTaken. Request was unsuccessfull');
  }

  return false;
};