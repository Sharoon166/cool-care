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
