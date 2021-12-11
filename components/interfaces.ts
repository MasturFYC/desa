import moment from "moment";

export const stringDateFormat = 'YYYY-MM-DD HH:mm';
export const hour24Format = 'YYYY-MM-DD HH24:MI';
const dateOnlyString = 'YYYY-MM-DD';
export const dateParam = (value?: string | undefined | null) => (value) ? moment(value, stringDateFormat).format(stringDateFormat) : moment(new Date(), stringDateFormat).format(stringDateFormat);
export const dateOnly = (value?: string | undefined | null, format: string = dateOnlyString) => (value) ? moment(value, dateOnlyString).format(format) : moment(new Date(), dateOnlyString).format(format);
export const setRefId = (id: number, code: string) => {
  return code + '-' + id.toString().padStart(9, '0');
}

export function add(accumulator: number, a: number) {
  return accumulator + a;
}

export interface iUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum customerType { BANDENG = "Bandeng", RUMPUT = "Rumput Laut", PABRIK = "Pabrik" }
export const isNullOrEmpty = (s: string | undefined): string | null => {
  if (undefined === s) return null;
  if (s === null) return null;
  if (s.trim().length === 0) return null;
  return s.trim();
}
export interface iUserLogin {
  userId: number;
  login: string;
  role: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
}

type piutang = {
  total: number
}

export interface iPiutang {
  id: number,
  descriptions: string,
  cred: number,
  debt: number,
  saldo: number
}
export interface iCustomer {
  id: number,
  name: string,
  street?: string,
  city?: string,
  phone?: string,
//  customerDiv: number;
  customerType: customerType;
  orders?: iOrder[];
}

export interface iCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  products?: iProduct[];
}
export interface iProduct {
  categoryId: number;
  id: number,
  name: string,
  spec?: string,
  price: number,
  stock: number,
  firstStock: number,
  unit: string,
  units?: iUnit[];
  category?: iCategory
}

export interface iUnit {
  productId: number,
  id: number,
  name: string,
  content: number,
  price: number,
  buyPrice: number,
  margin: number,
  product?: iProduct,
  isDefault?: boolean,
}

export interface iOrder {
  id: number;
  lunasId: number;
  customerId: number;
  orderDate: string;
  total: number;
  payment: number;
  remainPayment: number;
  descriptions: string;
  customer?: iCustomer;
}

export interface iOrderDetail {
  orderId: number;
  id: number;
  unitId: number;
  productId: number;
  productName?: string;
  spec?: string;
  qty: number;
  content: number;
  unitName: string;
  realQty: number;
  price: number;
  discount: number;
  buyPrice: number;
  subtotal: number;
  unit?: iUnit
  product?: iProduct;
}

export interface iKasbon {
  id: number;
  lunasId: number;
  refLunasId?: number;
  descriptions: string;
  customerId: number;
  kasbonDate: string;
  jatuhTempo: string;
  total: number;
  customer?: iCustomer;
}


export interface iPayment {
  id: number;
  lunasId: number;
  descriptions: string;
  customerId: number;
  paymentDate: string;
  refId: number;
  total: number;
  customer?: iCustomer;
}

export interface iGrass {
  customerId: number;
  id: number;
  descriptions: string;
  orderDate: string;
  lunasId: number;
  partnerId: number;
  qty: number;
  customer?: iCustomer;
  totalDiv: number;
  subtotal: number;
  total: number;
}

export interface iGrassDetail {
  grassId: number;
  id: number;
  unitId: number;
  qty: number;
  content: number;
  unitName: string;
  realQty: number;
  price: number;
  subtotal: number;
  buyPrice: number;
  productId: number;
  productName?: string;
  spec?: string;
}

export interface iSupplier {
  id: number;
  name: string;
  salesName?: string;
  street?:string;
  city?:string;
  phone?: string;
  cell?: string;
  email?:string;
}

export interface iStock {
  id: number;
  supplierId: number;
  stockNum: string;
  stockDate: string;
  total: number;
  cash: number;
  payments: number;
  remainPayment: number;
  descriptions?: string;
  supplier?: iSupplier;
  supplierName?: string;
}

export interface iStockDetail {
  stockId: number;
  id: number;
  productId: number;
  unitId: number;
  productName?: string;
  spec?: string;
  qty: number;
  content: number;
  unitName: string;
  realQty: number;
  price: number;
  discount: number;
  subtotal: number;
  unit?: iUnit
  product?: iProduct;
}

export interface iStockPayment {
  id: number;
  stockId: number;
  payNum: string;
  descriptions: string;
  payDate: string;
  nominal: number;
  stock?: iStock;
}


export interface iSpecialPayment {
  id: number;
  lunasId: number;
  orderId: number;
  customerId: number;
  payNum: string;
  descriptions: string;
  paymentAt: string;
  nominal: number;
  specialOrder?: iSpecialOrder;
}

export interface iSpecialOrder {
  id: number;
  lunasId: number;
  suratJalan: string;
  customerId: number;
  createdAt: string;
  updatedAt?: string;
  packagedAt: string;
  shippedAt: string;
  driverName: string;
  policeNumber: string;
  street: string;
  city: string;
  phone: string;
  total: number;
  cash: number;
  payments: number;
  remainPayment: number;
  descriptions?: string;
  customer?: iCustomer;
}

export interface iSpecialDetail extends iOrderDetail { }

export interface iLunas {
  id: number;
  customerId: number;
  remainPayment: number;
  descriptions: string;
  createdAt: string;
  updatedAt?: string;
}

export type grassCostType = {
  grassId: number;
  id: number;
  memo: string;
  qty: number;
  unit: string;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}