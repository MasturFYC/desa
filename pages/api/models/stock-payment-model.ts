import moment from 'moment';
import { dateParam, hour24Format, iStockPayment, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iStockPayment[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getBySupplier: (supplierId: number) => apiReturn;
  getPayment: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iStockPayment) => apiReturn;
  insert: (data: iStockPayment) => apiReturn;
}

const apiStockPayment: apiFunction = {
  getPayment: async (id: number) => {

    const query = sql`SELECT
    c.id, c.stock_id, c.pay_num, c.pay_date, c.nominal, c.descriptions
    from stock_payments AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT 
    c.id, c.stock_id, c.pay_num, c.pay_date, c.nominal, c.descriptions
    from stock_payments AS c
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getBySupplier: async (supplierId: number) => {

    const query = sql`SELECT
    c.id, c.stock_id, c.pay_num, c.pay_date, c.nominal, c.descriptions
    from stock_payments AS c
    inner join stocks s on s.id = c.stock_id
    WHERE s.supplier_id = ${supplierId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM stock_payments WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iStockPayment) => {
    const query = sql`
      UPDATE stock_payments SET
      stock_id = ${p.stockId},
      pay_date = to_timestamp(${dateParam(p.payDate)}, ${hour24Format}),
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

  insert: async (p: iStockPayment) => {

    const query = sql`
      INSERT INTO stock_payments (
        stock_id, pay_date, nominal, descriptions, pay_num
      ) VALUES (
        ${p.stockId},
        to_timestamp(${dateParam(p.payDate)}, ${hour24Format}),
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

export default apiStockPayment;
