import { NextApiRequest, NextApiResponse } from 'next';
import { iCustomer } from '@components/interfaces';
import order from '@model/stock-model';

export default async function stockApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query
  const result = await order.getBySupplier(+id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SUPPLIER STOCK:", req.method, error);
    res.status(403).json({ message: error.message });
  }

}