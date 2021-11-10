import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@lib/session";
import { iUserLogin } from "@components/interfaces";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse<iUserLogin>) {
  if (req.session.user) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json({
      ...req.session.user,
      isLoggedIn: true
    });
  } else {
    res.json({
      isLoggedIn: false,
      login: "",
      role: 'Admin',
      userId: 0,
      avatarUrl: "",
    });
  }
}