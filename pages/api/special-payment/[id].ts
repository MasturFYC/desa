import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/special-payment-model';

export default async function specialPaymentApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let result;

  switch (req.method) {
    case 'POST': {
      const { data } = req.body;
      result = await api.insert(data);
    }
      break;
    case 'PUT': {
      const id: number = req.query.id ? +req.query.id : 0;
      const { data } = req.body;
      result = await api.update(id, data);
    }
      break;
    case 'DELETE': {
      const id: number = req.query.id ? +req.query.id : 0;
      result = await api.delete(id);
    }
      break;
    case 'GET':
    default: {
      const id: number = req.query.id ? +req.query.id : 0;
      result = await api.getPayment(id);
    }
      break;
  }

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("SPECIAL PAYMENT Transaction: ", req.method, error);
    res.status(404).json({ message: 'SPECIAL PAYMENT tidak ditemukan.' });
  }

}