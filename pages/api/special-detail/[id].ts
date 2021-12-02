import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/special-detail-model';

export default async function specialDetailApi(
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
      result = await api.getByOrder(id);
    }
      break;
  }

  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("SPECIAL DETAIL Transaction: ", req.method, error);
    res.status(404).json({ message: 'SPECIAL DETAIL tidak ditemukan.' });
  }

}