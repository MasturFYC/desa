import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/stock-model';

export default async function stockApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const {ls} = req.query;
  const result = await api.list(ls ? +ls : 0);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR STOCK LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}