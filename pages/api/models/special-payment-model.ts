import moment from 'moment';
import { dateParam, hour24Format, iSpecialPayment, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iSpecialPayment[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getByCustomer: (customerId: number) => apiReturn;
  getPayment: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iSpecialPayment) => apiReturn;
  insert: (data: iSpecialPayment) => apiReturn;
}

const apiSpecialPayment: apiFunction = {

 
  getPayment: async (id: number) => {

    const query = sql`SELECT
      c.id, c.order_id, c.pay_num, c.payment_at, c.nominal, c.descriptions
    from special_payments AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT 
      c.id, c.order_id, c.pay_num, c.payment_at, c.nominal, c.descriptions
    from special_payments AS c
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number) => {

    const query = sql`SELECT
      c.id, c.order_id, c.pay_num, c.payment_at, c.nominal, c.descriptions
    from special_payments AS c
    WHERE c.customer_id = ${customerId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM special_payments WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iSpecialPayment) => {

    console.log(p)

    const query = sql`
      UPDATE special_payments SET
      order_id = ${p.orderId},
      customer_id = ${p.customerId},
      payment_at = to_timestamp(${dateParam(p.paymentAt)}, ${hour24Format}),
      nominal = ${p.nominal},
      descriptions = ${isNullOrEmpty(p.descriptions)},
      pay_num = ${p.payNum}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iSpecialPayment) => {

    const query = sql`
      INSERT INTO special_payments (
        order_id, customer_id, payment_at, nominal, descriptions, pay_num
      ) VALUES (
        ${p.orderId},
        ${p.customerId},
        to_timestamp(${dateParam(p.paymentAt)}, ${hour24Format}),
        ${p.nominal},
        ${isNullOrEmpty(p.descriptions)},
        ${p.payNum}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiSpecialPayment;
