import moment from 'moment';
import { dateParam, hour24Format, iLunas, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iLunas[] | undefined)[]>;

interface apiFunction {
  getByCustomer: (customerId: number) => apiReturn;
  getTransactions: (customerId: number, lunasId?: number | null) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iLunas) => apiReturn;
  insert: (data: iLunas) => apiReturn;
}

const apiLunas: apiFunction = {

  getTransactions: async (customerId: number, lunasId: number | undefined | null = 0) => {
    const query = sql`select * from lunas_get_transactions(${customerId},${lunasId})`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  getByCustomer: async (customerId: number) => {

    const query = sql`select
      c.id, c.customer_id, c.remain_payment, c.descriptions, c.created_at, c.updated_at
    from lunas c
    where c.customer_id = ${customerId}`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {

    const query = sql`
    DELETE FROM lunas WHERE id = ${id}
    RETURNING id`;


    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iLunas) => {
    const query = sql`
      UPDATE lunas SET
      customer_id = ${p.customerId},
      remain_payment = ${p.remainPayment},
      descriptions = ${p.descriptions},
      updated_at = to_timestamp(${dateParam(p.updatedAt)}, ${hour24Format})
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iLunas) => {

    const query = sql`
      INSERT INTO lunas (
        customer_id, remain_payment, descriptions, created_at
      ) VALUES (
        ${p.customerId},
        ${p.remainPayment},
        ${p.descriptions},
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

export default apiLunas;
