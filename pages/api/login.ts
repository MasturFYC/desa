import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { apiUser } from "@model/user-model";
import { iUserLogin } from "@components/interfaces";
export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = await req.body;
  const result = await apiUser.getUser(email, password);
  const [data] = result;

  try {
    const {id, name, role} = data;
    const user = { isLoggedIn: true, login: name, userId: id, role: role === 'admin' } as iUserLogin;
    req.session.user = user;
    await req.session.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}