import { NextApiRequest, NextApiResponse } from 'next';
import order from '@model/stock-payment-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query
  const result = await order.getBySupplier(+id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR STOCK PAYMENT BY SUPPLIER: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}