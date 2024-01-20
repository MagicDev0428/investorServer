import moment from 'moment';
import { getGoogleDriveInstance } from '../factories/google';
import { AUTH0_NAMESPACE, ROLES } from '../../constants';
import { ServiceError } from '../errors';
const fs = require('fs');



export const changeIntoFormat = async (response)=>{
    // Merge investorBalanceLists and newMyInvestments into one array
const balancesAndMyInvestments = await response.reduce((acc, item) => {
  if (item.investorBalanceLists) {
    acc.push(...item.investorBalanceLists);
  } else if (item.newMyInvestments) {
    acc.push(...item.newMyInvestments);
  }
  return acc;
}, []);

await balancesAndMyInvestments.sort((a, b) => {
  const dateA = a.profitMonth || a.startDate;
  const dateB = b.profitMonth || b.startDate;
  return new Date(dateA) - new Date(dateB);
});
// Extract totalMonthlyProfit and totalDeposit from the original response
const totalMonthlyProfit = await response.reduce((acc, item) => (item.totalMonthlyProfit !== undefined ? item.totalMonthlyProfit : acc), undefined);
const totalDeposit = await response.reduce((acc, item) => (item.totalDeposit !== undefined ? item.totalDeposit : acc), undefined);

// Create a single object with the merged array, totalMonthlyProfit, and totalDeposit
return {
    totalMonthlyProfit,
    totalDeposit,
    balancesAndMyInvestments,
};

}

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

export const returnTheInvestmentType = async (investorData) => {

	await investorData.forEach(investor_ => {

		// console.log("this is investor ==> ",investor_);
		if (investor_.investor.hasOwnProperty('accountInvestments') && investor_.investor.accountInvestments.hasOwnProperty('myInvestmentList')) {
			for (const investment of investor_.investor.accountInvestments.myInvestmentList) {
				if (investment.hasOwnProperty('investType') && (investment.investType === "Mixed" || investment.investType === "Monthly Profit")) {
					investor_.investor.getInvestType = true
					return true
					// break;
				} else {
					investor_.investor.getInvestType = false
				}
			}
		}
	})
	return investorData
}


export const  sumDepositAndEmailStatus = (objectsArray) => {
  

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
    const currentDay = currentDate.getDate();

    // Assuming each object has a 'date' property representing the date in the format 'YYYY-MM-DD'
    const isCurrentMonth = obj => {
        const date = new Date(obj.profitMonth);
        return date.getMonth() + 1 === currentMonth;
    };

	// Using the reduce function to iterate over the array and accumulate the sum
	const result = objectsArray.reduce(
		(accumulator, obj) => {

			// Check if the profitMonthPaid property is true for the current object
			if (obj.profitMonthPaid) {
				// Add the deposit amount to the sum
				accumulator.totalDeposit += obj.deposit;
			}

			// Check if emailDate is null for any object
			if (obj.emailDate === null) {
				accumulator.emailDateStatus = false;
			}


			return accumulator;
		}, {
			totalDeposit: 0,
			emailDateStatus: true,
      isBefore15th:false,
		} // Starting values for totalAmount and emailDateStatus
	);

      // Check if the current date is less than 15 and if there's any date in the array for the current month
    if (currentDay <15 && objectsArray.some(isCurrentMonth)) {
        result.isBefore15th = true;
    }

	return result;
}

export const removeNullValuesFromArray = arr => {
  const filteredArray = arr.filter(item => item !== null);
  return filteredArray;
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

export const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      // An error occurred while deleting the file
      if (err.code === 'ENOENT') {
        // The file does not exist
        console.error('The file does not exist');
      } else {
        // Some other error
        console.error(err.message);
      }
    } else {
      // The file was deleted successfully
      console.log('The file was deleted');
    }
  });  
}

export const readFile = function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}