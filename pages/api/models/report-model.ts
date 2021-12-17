import moment from 'moment';
import db, { sql } from "../config";

const apiReport = {
  getProfitByOrderId: async (id: number, orderType: number) => {
    const query = sql`select * from get_profit_by_order_id(${id},${orderType})`;

    //console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },

  getLRPenjualanByDate: async (startDate: string, endDate: string, saleType: number | undefined | null = 0) => {
    const query = sql`select * from get_profit_by_date_func(${startDate}, ${endDate}, ${saleType})`;

    //console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },  
  getLRPenjualanByOrderDate: async (date: string | string[]) => {
    const query = sql`select * from get_profit_by_date_order(${date})`;

    console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },

  getLRPenjualanByYear: async (year: number, month: number | undefined | null = 0) => {
    const query = sql`select * from get_profit_by_year(${year}, ${month})`;

    // console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },
  getLRPenjualanByMonth: async (year: number, month: number | undefined | null = 0) => {
    const query = sql`select * from get_profit_by_month(${year}, ${month})`;

    // console.log(query.sql,query.values)

    return await db
      .query(query)
      .then((data) => [data.rows, undefined])
      .catch((error) => [undefined, error]);

  },
};

export default apiReport;
