import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/supplier-model';

export default async function supplierApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query
  const result = await api.getBalanceDetail(+id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SUPPLIER BALANCE ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}