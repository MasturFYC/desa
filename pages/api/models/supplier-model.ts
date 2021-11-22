import moment from 'moment';
import { iSupplier, isNullOrEmpty } from '@components/interfaces'
import db, { nestQuerySingle, sql } from "../config";


type apiReturn = Promise<any[] | (readonly iSupplier[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  find: (name: string | string[]) => apiReturn;
  getSupplier: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iSupplier) => apiReturn;
  insert: (data: iSupplier) => apiReturn;
}

const apiSupplier: apiFunction = {

  getSupplier: async (id: number) => {
    const query = sql`SELECT
      c.id, c.name, c.sales_name, c.street, c.city, c.phone, c.cell, c.email
    FROM suppliers AS c
    WHERE c.id = ${id}`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT
      c.id, c.name, c.sales_name, c.street, c.city, c.phone, c.cell, c.email
    FROM suppliers AS c
    ORDER BY c.name`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  
  find: async (name: string | string[]) => {

    const query = sql`SELECT
      c.id, c.name, c.sales_name, c.street, c.city, c.phone, c.cell, c.email
    FROM suppliers AS c
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
    DELETE FROM suppliers
    WHERE id = ${id}
    RETURNING id
    `;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iSupplier) => {
    console.log(p)
    const query = sql`
      UPDATE suppliers SET
      name = ${p.name},
      sales_name = ${isNullOrEmpty(p.salesName)},
      street = ${isNullOrEmpty(p.street)},
      city = ${isNullOrEmpty(p.city)},
      phone = ${isNullOrEmpty(p.phone)},
      cell = ${isNullOrEmpty(p.cell)},
      email = ${isNullOrEmpty(p.email)}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iSupplier) => {

    const query = sql`
      INSERT INTO suppliers (
        name, sales_name, street, city, phone, cell, email
      ) VALUES (
        ${p.name},
        ${isNullOrEmpty(p.salesName)},
        ${isNullOrEmpty(p.street)},
        ${isNullOrEmpty(p.city)},
        ${isNullOrEmpty(p.phone)},
        ${isNullOrEmpty(p.cell)},
        ${isNullOrEmpty(p.email)}
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

export default apiSupplier;