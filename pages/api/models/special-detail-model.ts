import { iSpecialDetail } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iSpecialDetail[] | undefined)[]>;

interface apiFunction {
  getByOrder: (orderId: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iSpecialDetail) => apiReturn;
  insert: (data: iSpecialDetail) => apiReturn;
}

const apiSpecialDetail: apiFunction = {

  getByOrder: async (orderId: number) => {

    const query = sql`SELECT
    c.order_id, c.id, c.product_id, c.qty, c.unit_id, c.content,
    c.unit_name, c.real_qty, c.buy_price, c.price, c.subtotal,
    p.name as "productName", p.spec
    FROM special_details AS c
    INNER JOIN products as p ON p.id = c.product_id
    WHERE c.order_id = ${orderId}
    ORDER BY c.id`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM special_details
    WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iSpecialDetail) => {
    const query = sql`
      UPDATE special_details SET
        order_id = ${p.orderId},
        unit_id = ${p.unitId},
        product_id = ${p.productId},
        qty = ${p.qty},
        content = ${p.content},
        unit_name = ${p.unitName},
        price = ${p.price},
        buy_price = ${p.buyPrice}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iSpecialDetail) => {

    console.log(p);
    
    const query = sql`
      INSERT INTO special_details (
        order_id, unit_id, product_id, qty, content, unit_name, price, buy_price
      ) VALUES (
        ${p.orderId},
        ${p.unitId},
        ${p.productId},
        ${p.qty},
        ${p.content},
        ${p.unitName},
        ${p.price},
        ${p.buyPrice}
      )
      RETURNING *
    `;

    //console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiSpecialDetail;
