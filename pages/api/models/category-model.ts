import moment from 'moment';
import { dateParam, hour24Format, iCategory, isNullOrEmpty } from '@components/interfaces'
import db, { sql, nestQuery } from "../config";


type apiReturn = Promise<any[] | (readonly iCategory[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getProducts: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iCategory) => apiReturn;
  insert: (data: iCategory) => apiReturn;
}
const apiCategory: apiFunction = {

  getProducts: async (id: number) => {

    const queryUnit = sql`select
      u.product_id as "productId", u.id, u.name, u.content, u.price, u.buy_price as "buyPrice", is_default "isDefault"
      from units as u
      where u.product_id = c.id
      order by u.content`

    const query = sql`SELECT
      c.category_id, c.id, c.name, c.spec, c.price, c.stock, c.first_stock, c.unit,
      ${nestQuery(queryUnit)} as "units"
    FROM products AS c
    WHERE c.category_id = ${id} or ${id} = 0
    ORDER BY c.name`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {
    const query = sql`SELECT 
      c.id, c.name, c.created_at, c.updated_at
    FROM categories AS c
    order by c.name`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  delete: async (id: number) => {
    const query = sql`
    DELETE FROM categories
    WHERE id = ${id}
    RETURNING id`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iCategory) => {

    const query = sql`
      UPDATE categories SET
      name = ${p.name},
      updated_at = to_timestamp(${dateParam()}, ${hour24Format})
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iCategory) => {

    const query = sql`
      INSERT INTO categories (name) VALUES (${p.name})
      on conflict (name) do nothing
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiCategory;
