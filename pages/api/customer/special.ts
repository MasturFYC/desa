import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/customer-model';

export default async function customerApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await api.getCustomerSpecial();

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("CUSTOMER Transaction: ", req.method, error);
    res.status(404).json({ message: 'CUSTOMER tidak ditemukan.' });
  }

}