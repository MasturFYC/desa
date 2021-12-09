import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/grass-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query
  const result = await api.getByCustomer(+id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR CUSTOMER GRASS FIND: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}