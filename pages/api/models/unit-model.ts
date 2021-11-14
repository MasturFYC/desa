import moment from 'moment';
import { iUnit, isNullOrEmpty } from '@components/interfaces'
import db, { sql, nestQuery } from "../config";


type apiReturn = Promise<any[] | (readonly iUnit[] | undefined)[]>;

interface apiFunction {
  list: (productId: number) => apiReturn;
  find: (name: string | string[]) => apiReturn;
  getUnit: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iUnit) => apiReturn;
  insert: (data: iUnit) => apiReturn;
}

const apiUnit: apiFunction = {
  getUnit: async (id: number) => {

    const query = sql`select
      u.product_id, u.id, u.name, u.content, u.price, u.buy_price, u.margin
      from units as u
      where u.id = ${id}`

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async (productId: number) => {

    const query = sql`SELECT
    u.product_id, u.id, u.name, u.content, u.price, u.buy_price, u.margin
    FROM units AS u
    where (u.product_id = ${productId})
    order by u.content`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  find: async (name: string | string[]) => {

    const query = sql`select
      u.product_id , u.id, u.name, u.content, u.price, u.buy_price, u.margin
      from units as u
      where POSITION(${name} IN LOWER(u.name)) > 0
      order by u.name`

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM units
    WHERE id = ${id}
    RETURNING id`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iUnit) => {
    const query = sql`
      UPDATE units SET
      product_id = ${p.productId},
      name = ${p.name},
      content = ${p.content},
      price = ${p.price},
      buy_price = ${p.buyPrice},
      margin = ${p.margin}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iUnit) => {

    const query = sql`
      INSERT INTO units (
        product_id, name, content, price, buy_price, margin
      ) VALUES (
        ${p.productId},
        ${p.name},
        ${p.content},
        ${p.price},
        ${p.buyPrice},
        ${p.margin}
      )
      on conflict (product_id, name) do nothing
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiUnit;
