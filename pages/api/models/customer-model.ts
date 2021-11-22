import moment from 'moment';
import { iCustomer, isNullOrEmpty } from '@components/interfaces'
import db, { nestQuerySingle, sql } from "../config";


type apiReturn = Promise<any[] | (readonly iCustomer[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  find: (name: string | string[]) => apiReturn;
  getCustomer: (customerId: number) => apiReturn;
  getPiutang: (customerId: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iCustomer) => apiReturn;
  insert: (data: iCustomer) => apiReturn;
}

const apiCustomer: apiFunction = {

  getPiutang: async (id: number) => {

    // const qry_piutang = sql`select
    //   sum(o.remain_payment) as "total"
    //   from orders as o
    //   where o.customer_id = c.id`;

    // const qry_payment = sql`select
    //   sum(o.total) as "total"
    //   from payments as o
    //   where o.customer_id = c.id`;
    
    // const qry_kasbon = sql`select
    // sum(k.total) as "total"
    // from kasbons as k
    // where k.customer_id = c.id`;

    const query = sql`select * from piutang_balance_func(${id})`;
    // ${nestQuerySingle(qry_piutang)} as "piutang",
    // ${nestQuerySingle(qry_payment)} as "payment",
    // ${nestQuerySingle(qry_kasbon)} as "kasbon"
    // FROM customers AS c
    // WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },

  getCustomer: async (id: number) => {
    const query = sql`SELECT
      c.id, c.name, c.street, c.city, c.phone, c.customer_type
    FROM customers AS c
    WHERE c.id = ${id}`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT c.id, c.name, c.street, c.city, c.phone, c.customer_type
    FROM customers AS c
    ORDER BY c.name`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  
  find: async (name: string | string[]) => {

    const query = sql`SELECT c.id, c.name, c.street, c.city, c.phone, c.customer_type
    FROM customers AS c
    WHERE POSITION(${name} IN LOWER(c.name)) > 0
    ORDER BY c.name`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM customers
    WHERE id = ${id}
    RETURNING id
    `;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iCustomer) => {
    const query = sql`
      UPDATE customers SET
      name = ${p.name},
      street = ${isNullOrEmpty(p.street)},
      city = ${isNullOrEmpty(p.city)},
      phone = ${isNullOrEmpty(p.phone)},
      customer_type = ${p.customerType}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iCustomer) => {

    const query = sql`
      INSERT INTO customers (
        name, street, city, phone, customer_type
      ) VALUES (
        ${p.name},
        ${isNullOrEmpty(p.street)},
        ${isNullOrEmpty(p.city)},
        ${isNullOrEmpty(p.phone)},
        ${p.customerType}
      )
      on conflict (name) do nothing
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiCustomer;
