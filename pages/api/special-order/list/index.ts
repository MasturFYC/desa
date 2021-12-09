import { NextApiRequest, NextApiResponse } from 'next';
import order from '@model/special-order-model';

export default async function specialOrderApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const {all} = req.query;
  const result = await order.list(all === 'true');
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SPECIAL ORDER LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}