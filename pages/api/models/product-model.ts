import moment from 'moment';
import { iProduct, isNullOrEmpty } from '@components/interfaces'
import db, { sql, nestQuery } from "../config";


type apiReturn = Promise<any[] | (readonly iProduct[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getTransactionByProduct: (id: number) => apiReturn;
  listWithUnit: () => apiReturn;
  find: (name: string | string[]) => apiReturn;
  getProduct: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iProduct) => apiReturn;
  insert: (data: iProduct) => apiReturn;
}

const apiProduct: apiFunction = {
  getProduct: async (id: number) => {

    // const queryUnit = sql`select
    //   u.product_id as "productId", u.id, u.name, u.content, u.price
    //   from units as u
    //   where u.product_id = c.id
    //   order by u.content`
// ,
//   ${ nestQuery(queryUnit)} as "units"

    const query = sql`SELECT
      c.category_id, c.id, c.name, c.spec, c.price, c.stock, c.first_stock, c.unit
    FROM products AS c
    WHERE c.id = ${id}`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  getTransactionByProduct: async (id: number) => {
    const query = sql`select * from product_get_transaction_detail(${id})`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },

  list: async () => {
    const query = sql`SELECT 
      c.category_id, c.id, c.name, c.spec, c.price, c.stock, c.first_stock, c.unit
    FROM products AS c
    order by c.name`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  listWithUnit: async () => {

    const queryUnit = sql`select
      u.product_id as "productId", u.id, u.name, u.content, u.price, u.buy_price as "buyPrice"
      from units as u
      where u.product_id = c.id
      order by u.content DESC`
//,
    const query = sql`SELECT
      c.category_id, c.id, c.name, c.spec, c.price, c.stock, c.first_stock, c.unit,
    ${nestQuery(queryUnit)} as "units"
    FROM products AS c
    order by c.name`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  find: async (name: string | string[]) => {

    // const queryUnit = sql`select
    //   u.product_id as "productId", u.id, u.name, u.content, u.price
    //   from units as u
    //   where u.product_id = c.id
    //   order by u.content`
//    ${ nestQuery(queryUnit) } as "units"

    const query = sql`SELECT 
      c.category_id, c.id, c.name, c.spec, c.price, c.stock, c.first_stock, c.unit
    FROM products AS c
    WHERE POSITION(${name} IN LOWER(c.name)) > 0
    order by c.name`;


    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM products
    WHERE id = ${id}
    RETURNING id`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iProduct) => {

    const query = sql`
      UPDATE products SET
      category_id = ${p.categoryId},
      name = ${p.name},
      price = ${p.price},
      spec = ${isNullOrEmpty(p.spec)},
      first_stock = ${p.firstStock},
      unit = ${p.unit},
      update_notif = ${true}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iProduct) => {
    

    const query = sql`
      INSERT INTO products (
        category_id, name, spec, price, stock, first_stock, unit
      ) VALUES (
        ${p.categoryId},
        ${p.name},
        ${isNullOrEmpty(p.spec)},
        ${p.price},
        ${p.firstStock},
        ${p.firstStock},
        ${p.unit}
      )
      on conflict (name) do nothing
      RETURNING *
    `;

//    console.log(query.sql, query.values);

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiProduct;
