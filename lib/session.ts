// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import type { IronSessionOptions } from "iron-session";
import type { iUserLogin } from "@components/interfaces";

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "sumber-ikan-putri",
};

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    user?: iUserLogin;
  }
}