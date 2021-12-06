import moment from 'moment';
import { dateParam, hour24Format, iGrass } from '@components/interfaces'
import db, { nestQuerySingle, sql } from "../config";


type apiReturn = Promise<any[] | (readonly iGrass[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getByCustomer: (customerId: number, lunasId?: number  | null) => apiReturn;
  getGrass: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iGrass) => apiReturn;
  insert: (data: iGrass) => apiReturn;
}

const apiGrass: apiFunction = {
  getGrass: async (id: number) => {

    const queryCustomer = sql`SELECT
      d.id, d.name, d.street, d.city, d.phone, d.customer_type as "customerType", d.customer_div as "customerDiv"
    FROM customers AS d
    WHERE d.id = c.customer_id`;

    const query = sql`SELECT
      c.customer_id, c.id, c.descriptions, c.order_date, c.qty, c.price, c.total, c.total_div,
      c.product_id, c.unit_id, c.content, c.unit_name, c.real_qty, c.buy_price,
      ${nestQuerySingle(queryCustomer)} as customer
    FROM grass AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const queryCustomer = sql`SELECT
      d.id, d.name, d.street, d.city, d.phone, d.customer_type as "customerType", d.customer_div as "customerDiv"
    FROM customers AS d
    WHERE d.id = c.customer_id`;

    const query = sql`SELECT
      c.customer_id, c.id, c.descriptions, c.order_date, c.qty, c.price, c.total, c.total_div,
      c.product_id, c.unit_id, c.content, c.unit_name, c.real_qty, c.buy_price,
      ${nestQuerySingle(queryCustomer)} as customer
    FROM grass AS c
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number, lunasId: number | undefined | null = 0) => {

    const queryCustomer = sql`SELECT
      d.id, d.name, d.street, d.city, d.phone, d.customer_type as "customerType", d.customer_div as "customerDiv"
    FROM customers AS d
    WHERE d.id = c.customer_id`;

    const query = sql`SELECT
      c.customer_id, c.id, c.descriptions, c.order_date, c.qty, c.price, c.total, c.total_div,
      c.product_id, c.unit_id, c.content, c.unit_name, c.real_qty, c.buy_price,
      ${nestQuerySingle(queryCustomer)} as customer
    FROM grass AS c
    WHERE c.customer_id = ${customerId} AND c.lunas_id = ${lunasId}
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
      content = ${p.content},
      unit_name = ${p.unitName},
      unit_id = ${p.unitId},
      product_id = ${p.productId},
      buy_price = ${p.buyPrice},
      price = ${p.price},
      total_div = ${p.totalDiv}
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
        order_date, customer_id, descriptions, qty, price, total_div,
        product_id, unit_id, content, unit_name, buy_price
      ) VALUES (
        to_timestamp(${dateParam(p.orderDate)}, ${hour24Format}),
        ${p.customerId},
        ${p.descriptions},
        ${p.qty},
        ${p.price},
        ${p.totalDiv},
        ${p.productId},
        ${p.unitId},
        ${p.content},
        ${p.unitName},
        ${p.buyPrice}
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
