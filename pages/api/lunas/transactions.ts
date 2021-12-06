import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/payment-model';

export default async function lunasApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  let {id, lunasId} = req.body;
  
  let result = await api.getTransaction(+id, +lunasId);

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("LUNAS GET Transaction: ", req.method, error);
    res.status(404).json({ message: 'LUNAS GET TRANSACTION tidak ditemukan.' });
  }

}