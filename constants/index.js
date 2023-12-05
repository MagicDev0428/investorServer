export const DocumentTypes = {
  report: 'report',
  invoice: 'invoice',
  balanceSheet: 'balance-sheet',
  passport: 'passport'
};

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_REQUEST = 5;

export const SampleInvoice = {
  logo_url: 'https://sparksuite.github.io/simple-html-invoice-template/images/logo.png',
  invoice: {
    number: '123',
    date: 'January 1, 2023',
    due_date: 'February 1, 2023'
  },
  company: {
    name: 'Sparksuite, Inc.',
    street: '12345 Sunny Road',
    city: 'Sunnyville, CA',
    zip_code: '12345'
  },
  investor: {
    company_name: '',
    name: '',
    email: ''
  },
  payment_method: {
    name: 'Check',
    type: 'Check #',
    id: '1000'
  },
  collection: [
    { name: 'Website design', price: '$300.00' },
    { name: 'Hosting (3 months)', price: '$75.00' },
    { name: 'Domain name (1 year)', price: '$10.00' },
    { name: 'Website design', price: '$300.00' },
    { name: 'Website design', price: '$300.00' },
  ],
  total: '$385.00'
};