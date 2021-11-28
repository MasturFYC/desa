import { NextApiRequest, NextApiResponse } from 'next';
import { iCustomer } from '@components/interfaces';
import order from '@model/order-model';

export default async function ordersApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const result = await order.list();
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR ORDER LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}