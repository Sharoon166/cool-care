export const COMPANY_INFO = {
  name: 'Cool Care',
  tagline: 'Electrical & AC repair services',
  address: 'Iqbal Town, near Sohan Highway, Islamabad',
  phones: ['+92-336-3097147', '+92-315-5417036'],
  email: 'info@coolcare.com',
  website: 'www.coolcare.com',
  gstNumber: 'GST123456789'
} as const;

export const DATA_AVAILABILITY = {
  cutoffDate: new Date('2026-06-01'),
  message: 'Invoices and quotations before this date are not available in the portal.'
} as const;

export const PAYMENT_INFO = {
  bank: {
    bankName: 'HBL Bank Limited',
    accountName: 'Cool Care Solutions',
    accountNumber: 'PK12HABL1234567890123',
    iban: 'PK12HABL1234567890123456789',
    swiftCode: 'HABLPKKA'
  },
  jazzCash: {
    accountNumber: '0336-3097147',
    accountTitle: 'Allah Ditta Masih'
  },
  easyPaisa: {
    accountNumber: '0315-5417036',
    accountTitle: 'Sharoon Shalam'
  }
} as const;
