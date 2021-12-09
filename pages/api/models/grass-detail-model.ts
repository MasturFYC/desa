import { iGrassDetail } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iGrassDetail[] | undefined)[]>;

interface apiFunction {
  getByGrass: (grassId: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iGrassDetail) => apiReturn;
  insert: (data: iGrassDetail) => apiReturn;
}

const apiGrassDetail: apiFunction = {

  getByGrass: async (grassId: number) => {

    const query = sql`SELECT
      c.grass_id, c.id, c.unit_id, c.qty, c.content, c.unit_name, c.real_qty,
      c.price, c.subtotal, c.buy_price, c.product_id
    FROM grass_details AS c
    WHERE c.grass_id = ${grassId}
    ORDER BY c.id`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  delete: async (id: number) => {
    const query = sql`
    DELETE FROM grass_details WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iGrassDetail) => {
    const query = sql`
      UPDATE grass_details SET
        grass_id = ${p.grassId},
        unit_id = ${p.unitId},
        qty = ${p.qty},
        content = ${p.content},
        unit_name = ${p.unitName},
        price = ${p.price},
        buy_price = ${p.buyPrice},
        product_id  = ${p.productId}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iGrassDetail) => {

    const query = sql`
      INSERT INTO grass_details (
        grass_id, unit_id, qty, content, unit_name,
        price,  buy_price, product_id
      ) VALUES (
        ${p.grassId},
        ${p.unitId},
        ${p.qty},
        ${p.content},
        ${p.unitName},
        ${p.price},
        ${p.buyPrice},
        ${p.productId}
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

export default apiGrassDetail;
