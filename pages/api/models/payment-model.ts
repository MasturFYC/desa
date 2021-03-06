import moment from 'moment';
import { dateParam, hour24Format, iPayment, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iPayment[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getByCustomer: (customerId: number, lunasId?: number | null) => apiReturn;
  getBalanceDetail: (customerId: number, lunasId?: number | null) => apiReturn;
  getSpecialBalanceDetail: (customerId: number, lunasId?: number | null) => apiReturn;
  getSpecialTransaction: (customerId: number, lunasId?: number | null) => apiReturn;
  getTransaction: (customerId: number, lunasId?: number | null) => apiReturn;
  getPayment: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iPayment) => apiReturn;
  insert: (data: iPayment) => apiReturn;
}

const apiPayment: apiFunction = {

  getBalanceDetail: async (customerId: number, lunasId: number | undefined | null = 0) => {
    return await db
      .query(sql`select * from sip_cust_balance_detail(${customerId}, ${lunasId})`)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getTransaction: async (customerId: number, lunasId: number | undefined | null = 0) => {
    const query = sql`select * from customer_get_transaction_detail(${customerId}, ${lunasId})`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getSpecialTransaction: async (customerId: number, lunasId: number | undefined | null = 0) => {
    const query = sql`select * from customer_get_special_transaction(${customerId}, ${lunasId})`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  getSpecialBalanceDetail: async (customerId: number, lunasId: number | undefined | null = 0) => {
    const query = sql`select * from special_customer_get_balance(${customerId}, ${lunasId})`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getPayment: async (id: number) => {

    const query = sql`SELECT
    c.id, c.customer_id, c.ref_id, c.payment_date, c.total, c.descriptions
    from payments AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT 
    c.id, c.customer_id, c.ref_id, c.payment_date, c.total, c.descriptions
    from payments AS c
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number, lunasId: number | undefined | null = 0) => {

    const query = sql`SELECT
    c.id, c.customer_id, c.ref_id, c.payment_date, c.total, c.descriptions
    from payments AS c
    WHERE c.customer_id = ${customerId} and lunas_id = ${lunasId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM payments WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iPayment) => {
    const query = sql`
      UPDATE payments SET
      customer_id = ${p.customerId},
      payment_date = to_timestamp(${dateParam(p.paymentDate)}, ${hour24Format}),
      total = ${p.total},
      descriptions = ${p.descriptions}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iPayment) => {

    const query = sql`
      INSERT INTO payments (
        customer_id, payment_date, total, descriptions
      ) VALUES (
        ${p.customerId},
        to_timestamp(${dateParam(p.paymentDate)}, ${hour24Format}),
        ${p.total},
        ${p.descriptions}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiPayment;
