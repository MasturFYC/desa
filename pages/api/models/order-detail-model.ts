import { iOrderDetail } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iOrderDetail[] | undefined)[]>;

interface apiFunction {
  getByOrder: (orderId: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iOrderDetail) => apiReturn;
  insert: (data: iOrderDetail) => apiReturn;
}
 
const apiOrderDetail: apiFunction = {

  getByOrder: async (orderId: number) => {

    const query = sql`SELECT
    c.order_id, c.id, c.product_id, c.qty, c.unit_id, c.content,
    c.unit_name, c.real_qty, c.buy_price, c.price, c.discount, c.subtotal,
    p.name as "productName", p.spec
    FROM order_details AS c
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
    DELETE FROM order_details
    WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iOrderDetail) => {
    const query = sql`
      UPDATE order_details SET
        order_id = ${p.orderId},
        unit_id = ${p.unitId},
        product_id = ${p.productId},
        qty = ${p.qty},
        content = ${p.content},
        unit_name = ${p.unitName},
        price = ${p.price},
        discount = ${p.discount},
        buy_price = ${p.buyPrice}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iOrderDetail) => {

    const query = sql`
      INSERT INTO order_details (
        order_id, unit_id, product_id, qty, content, unit_name, price, discount, buy_price
      ) VALUES (
        ${p.orderId},
        ${p.unitId},
        ${p.productId},
        ${p.qty},
        ${p.content},
        ${p.unitName},
        ${p.price},
        ${p.discount},
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

export default apiOrderDetail;
