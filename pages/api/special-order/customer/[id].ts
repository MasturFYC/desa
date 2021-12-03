import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/special-order-model';

export default async function specialOrderApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const id: number = req.query.id ? +req.query.id : 0;
  const result = await api.getByCustomer(id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SPECIAL ORDER BY CUSTOMER: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}