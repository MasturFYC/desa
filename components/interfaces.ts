import { NONAME } from "dns";
import moment from "moment";

const stringDateFormat = 'YYYY-MM-DD HH:mm';
export const hour24Format = 'YYYY-MM-DD HH24:MI';
const dateOnlyString = 'YYYY-MM-DD';
export const dateParam = (value?: string | undefined | null) => (value) ? moment(value, stringDateFormat).format(stringDateFormat) : moment(new Date(), stringDateFormat).format(stringDateFormat);
export const dateOnly = (value?: string | undefined | null, format: string = dateOnlyString) => (value) ? moment(value, dateOnlyString).format(format) : moment(new Date(), dateOnlyString).format(format);
export const setRefId = (id: number, code: string) => {
  return code + '-' + id.toString().padStart(9, '0');
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

export enum customerType { BANDENG = "Bandeng", RUMPUT = "Rumput Laut" }
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

export interface iCustomer {
  id: number,
  name: string,
  street?: string,
  city?: string,
  phone?: string,
  customerType: customerType;
  orders?: iOrder[];
}

export interface iProduct {
  id: number,
  name: string,
  spec?: string,
  price: number,
  stock: number,
  firstStock: number,
  unit: string,
  units?: iUnit[]
}

export interface iUnit {
  productId: number,
  id: number,
  name: string,
  content: number,
  price: number,
  buyPrice: number,
  margin: number,
  product?: iProduct
}

export interface iOrder {
  id: number;
  customerId: number;
  orderDate: string;
  total: number;
  payment: number;
  remainPayment: number;
  descriptions: string;
  customer?: iCustomer;
}