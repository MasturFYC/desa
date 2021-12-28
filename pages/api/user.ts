import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { iUserLogin } from "@components/interfaces";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse<iUserLogin>) {
  if (req.session.user) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      userId: 0,
      isLoggedIn: false,
      login: "",
      role: false
    });
  }
}