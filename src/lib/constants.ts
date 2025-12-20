export const COMPANY_INFO = {
	name: 'Cool Care',
	address: 'Iqbal Town, near Sohan Highway, Islamabad',
	phones: ['+92-336-3097147', '+92-315-5417036'],
	email: 'info@coolcare.com',
	website: 'www.coolcare.com',
	gstNumber: 'GST123456789'
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
		accountNumber: '0315-5417036',
		accountTitle: 'Sharoon Shalam'
	},
	easyPaisa: {
		accountNumber: '0336-3097147',
		accountTitle: 'Allah Ditta Masih'
	}
} as const;
