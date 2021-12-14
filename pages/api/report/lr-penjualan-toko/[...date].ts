import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/report-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let {date} = req.query;
  let startDate = date[0];
  let endDate = date[1];

  let result = await api.getLRPenjualanToko(startDate,endDate);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR LAPORAN PENJUALAN TOKO: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}