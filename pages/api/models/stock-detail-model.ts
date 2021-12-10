import { iStockDetail } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iStockDetail[] | undefined)[]>;

interface apiFunction {
  getByStock: (stockId: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iStockDetail) => apiReturn;
  insert: (data: iStockDetail) => apiReturn;
}

const apiStockDetail: apiFunction = {

  getByStock: async (stockId: number) => {

    const query = sql`SELECT
      c.stock_id, c.id, c.unit_id, c.product_id, c.qty, c.content,
      c.unit_name, c.real_qty, c.price, c.subtotal, c.discount, 
      p.name as "productName", p.spec
    FROM stock_details AS c
    INNER JOIN products as p ON p.id = c.product_id
    WHERE c.stock_id = ${stockId}
    ORDER BY c.id`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM stock_details
    WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iStockDetail) => {
    const query = sql`
      UPDATE stock_details SET
        stock_id = ${p.stockId},
        unit_id = ${p.unitId},
        product_id = ${p.productId},
        qty = ${p.qty},
        content = ${p.content},
        unit_name = ${p.unitName},
        price = ${p.price},
        discount = ${p.discount}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iStockDetail) => {

    const query = sql`
      INSERT INTO stock_details (
        stock_id, unit_id, product_id, qty, content, unit_name, price, discount
      ) VALUES (
        ${p.stockId},
        ${p.unitId},
        ${p.productId},
        ${p.qty},
        ${p.content},
        ${p.unitName},
        ${p.price},
        ${p.discount}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiStockDetail;