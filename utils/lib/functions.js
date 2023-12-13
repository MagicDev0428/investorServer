import { AUTH0_NAMESPACE, ROLES } from '../../constants';

export const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}-${hour}:${minutes}`;
};

export const transformNameToPath = name => name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

export const pingenerator = () => {
  // Generating pin between 10 to 99
  const randomPin = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
  return `${randomPin}${randomPin}`;
};

export const isAdminOrLoggedInInvestor = (auth, email) => {
  if (auth) {
    const namespace = auth[AUTH0_NAMESPACE];
    if (namespace.roles && (namespace.roles.includes(ROLES.admin) || namespace.email === email)) {
      return true    
    }
  }
  return false;
};

export const getAdminName = auth => auth[AUTH0_NAMESPACE].name;