import { NextApiRequest, NextApiResponse } from 'next';
import api from '@model/special-order-model';

export default async function specialOrderApi(
  req: NextApiRequest,
  res: NextApiResponse
) {

  console.log(req.query)

  const {id} = req.query; //.id ? +req.query.id : 0;
  const custId = id[0];
  const all = id[1];

  const result = await api.getByCustomer(+custId, all ? all === 'true' : false);
  const [data, error] = result;

  if (data) {
    res.status(200).json(data);
  } else {
    console.log("ERROR SPECIAL ORDER BY CUSTOMER: ", req.method, error);
    res.status(403).json({ message: error.message });
  }

}