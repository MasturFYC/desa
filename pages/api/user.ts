import { ironOptions } from "@lib/config";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(userRoute, ironOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse) {
  res.send(req.session.user);
}