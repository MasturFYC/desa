import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/supplier-model';

export default async function supplierApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await api.list();
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SUPPLIER LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}