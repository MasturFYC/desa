import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/unit-model';

export default async function unitApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {id} = req.query;
  let prodId = id[0];
  let unitId = id[1];
  let result = await api.setDefault(+prodId, +unitId);

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("UNIT SET DEFAULT: ", req.method, error);
    res.status(404).json({ message: 'UNIT SET DEFAULT tidak ditemukan.' });
  }

}