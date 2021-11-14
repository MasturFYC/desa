import { NextApiRequest, NextApiResponse } from 'next';
import { iCustomer } from '@components/interfaces';
import order from '@model/order-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query
  const result = await order.getByCustomer(+id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR CUSTOMER ORDER FIND: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}