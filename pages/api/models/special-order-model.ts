import moment from 'moment';
import { dateParam, hour24Format, iSpecialOrder, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iSpecialOrder[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  search: (name: string) => apiReturn;
  getByCustomer: (customerId: number) => apiReturn;
  getOrder: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iSpecialOrder) => apiReturn;
  insert: (data: iSpecialOrder) => apiReturn;
}

const apiSpecialOrder: apiFunction = {
  getOrder: async (id: number) => {

    const query = sql`SELECT
      c.id, c.customer_id, c.created_at, c.updated_at, c.packaged_at, c.shipped_at,
      c.driver_name, c.police_number, c.street, c.city, c.phone,
      c.total, c.cash, c.payments, c.remain_payment, c.descriptions
    FROM special_orders AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  search: async (name: string) => {

    const id = isNaN(parseInt(name)) ? 0 : parseInt(name);

    const query = id === 0 ? sql`SELECT
      c.id, c.customer_id, c.created_at, c.updated_at, c.packaged_at, c.shipped_at,
      c.driver_name, c.police_number, c.street, c.city, c.phone,
      c.total, c.cash, c.payments, c.remain_payment, c.descriptions, cust.name
    FROM special_orders AS c
    inner join customers cust on cust.id = c.customer_id
    WHERE POSITION(${name} IN LOWER(cust.name)) > 0
    ORDER BY cust.name` :
      sql`SELECT
      c.id, c.customer_id, c.created_at, c.updated_at, c.packaged_at, c.shipped_at,
      c.driver_name, c.police_number, c.street, c.city, c.phone,
      c.total, c.cash, c.payments, c.remain_payment, c.descriptions, cust.name
    FROM special_orders AS c
    inner join customers cust on cust.id = c.customer_id
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  list: async() => {

    const query = sql`SELECT
      c.id, c.customer_id, c.created_at, c.updated_at, c.packaged_at, c.shipped_at,
      c.driver_name, c.police_number, c.street, c.city, c.phone,
      c.total, c.cash, c.payments, c.remain_payment, c.descriptions, cust.name
    FROM special_orders AS c
    inner join customers cust on cust.id = c.customer_id
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number) => {

    const query = sql`SELECT
      c.id, c.customer_id, c.created_at, c.updated_at, c.packaged_at, c.shipped_at,
      c.driver_name, c.police_number, c.street, c.city, c.phone,
      c.total, c.cash, c.payments, c.remain_payment, c.descriptions
    FROM special_orders AS c
    WHERE c.customer_id = ${customerId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM special_orders
    WHERE id = ${id}
    RETURNING id`;
    
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iSpecialOrder) => {
    const query = sql`
      UPDATE special_orders SET
      customer_id = ${p.customerId},
      created_at = to_timestamp(${dateParam(p.createdAt)}, ${hour24Format}),
      packaged_at = to_timestamp(${dateParam(p.packagedAt)}, ${hour24Format}),
      shipped_at = to_timestamp(${dateParam(p.shippedAt)}, ${hour24Format}),
      driver_name = ${p.driverName},
      police_number = ${p.policeNumber},
      street = ${p.street},
      city = ${p.city},
      phone = ${p.phone},
      cash = ${p.cash},
      descriptions = ${p.descriptions || null}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iSpecialOrder) => {

    const query = sql`
      INSERT INTO special_orders (
        customer_id, created_at, packaged_at, shipped_at, driver_name,
        police_number, street, city, phone, cash, descriptions
      ) VALUES (
        ${p.customerId},
        to_timestamp(${dateParam(p.createdAt)}, ${hour24Format}),
        to_timestamp(${dateParam(p.packagedAt)}, ${hour24Format}),
        to_timestamp(${dateParam(p.shippedAt)}, ${hour24Format}),
        ${p.driverName},
        ${p.policeNumber},
        ${p.street},
        ${p.city},
        ${p.phone},
        ${p.cash},
        ${p.descriptions || null}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiSpecialOrder;
