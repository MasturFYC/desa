import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/special-order-model';

export default async function specialOrderApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const {name} = req.query
  const result = await api.search(name.toString());
  const [data, error] = result;


  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SPECIAL ORDER FIND: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}