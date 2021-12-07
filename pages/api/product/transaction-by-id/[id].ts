import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/product-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const id: number = req.query.id ? +req.query.id : 0;
  let result = await api.getTransactionByProduct(id);

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("PRODUCT Transaction: ", req.method, error);
    res.status(404).json({ message: 'PRODUCT tidak ditemukan.' });
  }

}