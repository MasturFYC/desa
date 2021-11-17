import moment from 'moment';
import { dateParam, hour24Format, iKasbon, isNullOrEmpty } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iKasbon[] | undefined)[]>;

interface apiFunction {
  list: () => apiReturn;
  getByCustomer: (customerId: number) => apiReturn;
  getKasbon: (id: number) => apiReturn;
  delete: (id: number) => apiReturn;
  update: (id: number, data: iKasbon) => apiReturn;
  insert: (data: iKasbon) => apiReturn;
}

const apiKasbon: apiFunction = {
  getKasbon: async (id: number) => {

    const query = sql`SELECT
    c.id, c.customer_id, c.kasbon_date, c.jatuh_tempo, c.total, c.descriptions
    from kasbons AS c
    WHERE c.id = ${id}`;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  list: async () => {

    const query = sql`SELECT 
    c.id, c.customer_id, c.kasbon_date, c.jatuh_tempo, c.total, c.descriptions
    from kasbons AS c
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },

  getByCustomer: async (customerId: number) => {

    const query = sql`SELECT
    c.id, c.customer_id, c.kasbon_date, c.jatuh_tempo, c.total, c.descriptions
    from kasbons AS c
    WHERE c.customer_id = ${customerId}
    ORDER BY c.id DESC`;

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);
  },
  
  delete: async (id: number) => {
    const query = sql`
    DELETE FROM kasbons
    WHERE id = ${id}
    RETURNING id`;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iKasbon) => {
    const query = sql`
      UPDATE kasbons SET
      customer_id = ${p.customerId},
      kasbon_date = to_timestamp(${dateParam(p.kasbonDate)}, ${hour24Format}),
      jatuh_tempo = to_timestamp(${dateParam(p.jatuhTempo)}, ${hour24Format}),
      total = ${p.total},
      descriptions = ${p.descriptions}
      WHERE id = ${p.id}
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iKasbon) => {

    const query = sql`
      INSERT INTO kasbons (
        customer_id, kasbon_date, jatuh_tempo, total, descriptions
      ) VALUES (
        ${p.customerId},
        to_timestamp(${dateParam(p.kasbonDate)}, ${hour24Format}),
        to_timestamp(${dateParam(p.jatuhTempo)}, ${hour24Format}),
        ${p.total},
        ${p.descriptions}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiKasbon;
