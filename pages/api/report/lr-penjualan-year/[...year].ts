import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/report-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let {year} = req.query;
  let y = +year[0];
  let m = year[1] ? +year[1] : 0;

  let result = await api.getLRPenjualanByYear(y,m);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR LAPORAN PENJUALAN TOKO: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}