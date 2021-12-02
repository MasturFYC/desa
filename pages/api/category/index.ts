import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/category-model';

export default async function categoryApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await api.list();
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR CATEGORY LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}