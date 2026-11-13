export interface EmModel {
	balance: number;
	bankMid: string;
	bankTid: string;
	cardNo: string;
	cardType: string;
	createdAt: string;
	filename: string;
	incomingFileFTP: string;
	respon: string;
	transCounter: string;
	transLog: string;
	updatedAt: string;
}

export interface PaylaterItemDetailModel {
	itemId: string;
	itemName: string;
	itemType: string;
	itemURL: string;
	price: number;
	quantity: number;
	totalPrice: number;
}

export interface PaylaterModel {
	customerBillAddress: string;
	customerBillCity: string;
	customerBillCountry: string;
	customerBillState: string;
	customerBillZipCode: string;
	customerEmail: string;
	customerName: string;
	customerPhone: string;
	itemDetails: PaylaterItemDetailModel[];
}

export interface DetailEmPaylaterModel {
	em: EmModel;
	paylater: PaylaterModel;
}

