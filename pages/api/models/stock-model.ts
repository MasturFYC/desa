import moment from 'moment';
import { dateParam, hour24Format, iStock, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iStock[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  find: (name: string | string[]) => apiReturn;
  getBySupplier: (supplierId: number) => apiReturn;
  getStock: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iStock) => apiReturn;
  insert: (data: iStock) => apiReturn;
}

const apiStock: apiFunction = {


  find: async (name: string | string[]) => {

    const query = sql`SELECT
      c.id, c.supplier_id, c.stock_num, c.stock_date, c.total, c.cash, c.payments, c.remain_payment, c.descriptions
    FROM stocks AS c
    WHERE POSITION(${name} IN LOWER(c.stock_num)) > 0
    ORDER BY c.stock_num`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getStock: async (id: number) => {

    const query = sql`SELECT
      c.id, c.supplier_id, c.stock_num, c.stock_date, c.total, c.cash, c.payments, c.remain_payment, c.descriptions
    FROM stocks AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT
      c.id, c.supplier_id, c.stock_num, c.stock_date, c.total, c.cash, c.payments, c.remain_payment, c.descriptions,
      s.name as "supplierName"
    FROM stocks AS c
    inner join suppliers s on s.id = c.supplier_id
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getBySupplier: async (supplierId: number) => {

    const query = sql`SELECT
      c.id, c.supplier_id, c.stock_num, c.stock_date, c.total, c.cash, c.payments, c.remain_payment, c.descriptions
    FROM stocks AS c
    WHERE c.supplier_id = ${supplierId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM stocks
    WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iStock) => {
    const query = sql`
      UPDATE stocks SET
      supplier_id = ${p.supplierId},
      stock_num = ${p.stockNum},
      stock_date = to_timestamp(${dateParam(p.stockDate)}, ${hour24Format}),
      descriptions = ${isNullOrEmpty(p.descriptions)},
      cash = ${p.cash}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iStock) => {

    const query = sql`
      INSERT INTO stocks (
        supplier_id, stock_num, stock_date, descriptions
      ) VALUES (
        ${p.supplierId},
        ${p.stockNum},
        to_timestamp(${dateParam(p.stockDate)}, ${hour24Format}),
        ${isNullOrEmpty(p.descriptions)}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiStock;
