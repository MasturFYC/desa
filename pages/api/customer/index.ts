import { NextApiRequest, NextApiResponse } from 'next';
import { iCustomer } from '@components/interfaces';
import api from '@model/customer-model';

export default async function productApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await api.list();
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR CUSTOMER LIST: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}