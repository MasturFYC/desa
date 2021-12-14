import moment from 'moment';
import db, { sql } from "../config";

const apiReport = {
  getLRPenjualanToko: async (startDate: string, endDate: string) => {
    const query = sql`select * from get_toko_profit_func(${startDate}, ${endDate})`;

    //console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },
  getLRPenjualanProduct: async (startDate: string, endDate: string) => {
    const query = sql`select * from get_product_profit_func(${startDate}, ${endDate})`;

    console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },
};

export default apiReport;
