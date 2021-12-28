import { iUser } from '@components/interfaces'
import db, { sql } from "../config";


type apiReturn = Promise<any[] | (readonly iUser[] | undefined)[]>;

interface apiFunction {
  getUser: (email: string, password: string) => apiReturn;
  delete: (email: string, password: string) => apiReturn;
  update: (id: number, data: iUser) => apiReturn;
  insert: (data: iUser) => apiReturn;
}

export const apiUser: apiFunction = {
  getUser: async (email: string, password: string) => {

    const query = sql`SELECT id, name, email, password, role
      FROM users
      WHERE email = ${email} AND password = ${password}`;

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
      password = ${p.password}
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
        ${p.password}
        ${'User'}
      )
      RETURNING *
    `;

    return await db
      .query(query)
      .then((data) => [data.rows[0], undefined])
      .catch((error) => [undefined, error]);
  },
};
