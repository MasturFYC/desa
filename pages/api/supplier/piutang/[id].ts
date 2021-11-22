import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/supplier-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
      const id: number = req.query.id ? +req.query.id : 0;
      let result = await api.getPiutang(id);

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR CUSTOMER PIUTANG: ", req.method, error);
    res.status(404).json({ message: 'ERROR CUSTOMER PIUTANG.' });
  }

}