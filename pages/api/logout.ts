import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { iUserLogin } from "@components/interfaces";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

function logoutRoute(req: NextApiRequest, res: NextApiResponse<iUserLogin>) {
  req.session.destroy();
  res.json({ isLoggedIn: false, login: "", role: false, userId: 0 });
}