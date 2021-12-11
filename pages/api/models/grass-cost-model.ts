import { dateParam, hour24Format, grassCostType } from '@components/interfaces'
import db, { sql } from "../config";

type apiReturn = Promise<any[] | (readonly grassCostType[] | undefined)[]>;

interface apiFunction {
  getByGrass: (grassId: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: grassCostType) => apiReturn;
  insert: (data: grassCostType) => apiReturn;
}

const apgrassCrossType: apiFunction = {
  getByGrass: async (grassId: number) => {

    const query = sql`SELECT
      grass_id, id, memo, qty, unit, price, subtotal, created_at, updated_at
    FROM grass_costs
    WHERE grass_id = ${grassId}
    ORDER BY id`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM grass_costs WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: grassCostType) => {

    const query = sql`
      UPDATE grass_costs SET
        grass_id = ${p.grassId},
        memo = ${p.memo},
        qty = ${p.qty},
        unit = ${p.unit},
        price = ${p.price},
        updated_at = to_timestamp(${dateParam(p.updatedAt)}, ${hour24Format})
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: grassCostType) => {

    const query = sql`
      INSERT INTO grass_costs (
        grass_id, memo, qty, unit, price, created_at
      ) VALUES (
        ${p.grassId},
        ${p.memo},
        ${p.qty},
        ${p.unit},
        ${p.price},
        to_timestamp(${dateParam(p.createdAt)}, ${hour24Format})
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apgrassCrossType;
