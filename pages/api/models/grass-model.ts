import moment from 'moment';
import { dateParam, hour24Format, iGrass, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iGrass[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getByCustomer: (customerId: number) => apiReturn;
  getGrass: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iGrass) => apiReturn;
  insert: (data: iGrass) => apiReturn;
}

const apiGrass: apiFunction = {
  getGrass: async (id: number) => {

    const query = sql`SELECT
      c.customer_id, c.id, c.descriptions, c.order_date, c.qty, c.price, c.total
    FROM grass AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT
      c.customer_id, c.id, c.descriptions, c.order_date, c.qty, c.price, c.total
    FROM grass AS c
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number) => {

    const query = sql`SELECT
      c.customer_id, c.id, c.descriptions, c.order_date, c.qty, c.price, c.total
    FROM grass AS c
    WHERE c.customer_id = ${customerId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM grass WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iGrass) => {
    const query = sql`
      UPDATE grass SET
      order_date = to_timestamp(${dateParam(p.orderDate)}, ${hour24Format}),
      customer_id = ${p.customerId},
      descriptions = ${p.descriptions},      
      qty = ${p.qty},
      price = ${p.price}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iGrass) => {

    const query = sql`
      INSERT INTO grass (
        order_date, customer_id, descriptions, qty, price
      ) VALUES (
        to_timestamp(${dateParam(p.orderDate)}, ${hour24Format}),
        ${p.customerId},
        ${p.descriptions},
        ${p.qty},
        ${p.price}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiGrass;
