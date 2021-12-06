import moment from 'moment';
import { dateParam, hour24Format, iOrder, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iOrder[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  search: (name: string) => apiReturn;
  getByCustomer: (customerId: number, lunasId?: number | null ) => apiReturn;
  getOrder: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iOrder) => apiReturn;
  insert: (data: iOrder) => apiReturn;
}

const apiOrder: apiFunction = {
  getOrder: async (id: number) => {

    const query = sql`SELECT c.id, c.customer_id, c.order_date, c.total, c.payment, c.remain_payment, c.descriptions
    FROM orders AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  search: async (name: string) => {

    const id = isNaN(parseInt(name)) ? 0 : parseInt(name);

    const query = id === 0 ? sql`SELECT
      c.id, c.customer_id, c.order_date, c.total, c.payment,
      c.remain_payment, c.descriptions, cust.name
    FROM orders AS c
    inner join customers cust on cust.id = c.customer_id
    WHERE POSITION(${name} IN LOWER(cust.name)) > 0 OR POSITION(${name} IN LOWER(c.descriptions)) > 0
    ORDER BY cust.name` :
      sql`SELECT
      c.id, c.customer_id, c.order_date, c.total, c.payment,
      c.remain_payment, c.descriptions, cust.name
    FROM orders AS c
    inner join customers cust on cust.id = c.customer_id
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  list: async() => {

    const query = sql`SELECT
      c.id, c.customer_id, c.order_date, c.total, c.payment,
      c.remain_payment, c.descriptions, cust.name
    FROM orders AS c
    inner join customers cust on cust.id = c.customer_id
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number, lunasId: number | undefined | null = 0) => {

    const query = sql`SELECT c.id, c.customer_id, c.order_date, c.total, c.payment, c.remain_payment, c.descriptions
    FROM orders AS c
    WHERE c.customer_id = ${customerId} and c.lunas_id = ${lunasId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM orders
    WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iOrder) => {
    const query = sql`
      UPDATE orders SET
      customer_id = ${p.customerId},
      order_date = to_timestamp(${dateParam(p.orderDate)}, ${hour24Format}),
      descriptions = ${p.descriptions},
      payment = ${p.payment}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iOrder) => {

    const query = sql`
      INSERT INTO orders (
        customer_id, order_date, descriptions
      ) VALUES (
        ${p.customerId},
        to_timestamp(${dateParam(p.orderDate)}, ${hour24Format}),
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

export default apiOrder;
