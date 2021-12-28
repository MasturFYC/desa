import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { iUserLogin } from "@components/interfaces";

export default withIronSessionApiRoute(eventsRoute, sessionOptions);

async function eventsRoute(req: NextApiRequest, res: NextApiResponse<iUserLogin>) {
  const user = req.session.user;

  if (!user || user.isLoggedIn === false) {
    res.status(401).end();
    return;
  }

  try {
    res.json(user);
  } catch (error) {
    res.status(200).json({} as iUserLogin );
  }
}