import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/unit-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id: number = req.query.id ? +req.query.id : 0;
  const result = await api.list(id);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR UNIT LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}