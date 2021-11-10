import moment from 'moment';
import { iUser } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iUser[] | undefined)[]>;

interface apiFunction {
  getUser: (email: string, password: string) => apiReturn;
  delete: (email: string, password: string) => apiReturn;
  update: (id: number, data: iUser) => apiReturn;
  insert: (data: iUser) => apiReturn;
}

const apiUser: apiFunction = {
  getUser: async (email: string, password: string) => {

    const query = sql`SELECT id, name, email, password, role, spbu_id, photo
      FROM users
      WHERE email = ${email} AND password = ${password}`;

    //      console.log(query.sql, query.values)

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  delete: async (email: string, password: string) => {
    const query = sql`
    DELETE FROM users
    WHERE (email = ${email} AND password = ${password})
    RETURNING id
    `;
    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  update: async (id: number, p: iUser) => {
    const query = sql`
      UPDATE users SET
      name = ${p.name},
      email = ${p.email},
      password = ${p.password},
      updated_at = to_timestamp(${moment().format()}, 'YYYY-MM-DD HH:MI'),
      role = ${p.role}
      WHERE (email = ${p.email} AND password = ${p.password})
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },

  insert: async (p: iUser) => {
    const query = sql`
      INSERT INTO users (
        name, email, password, role
      ) VALUES (
        ${p.name},
        ${p.email},
        ${p.password},
        ${p.role}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};

export default apiUser;
