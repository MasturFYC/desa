import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/unit-model';

export default async function unitApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const {name} = req.query
  const result = await api.find(name);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR UNIT FIND: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}