// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { iUserLogin } from "@components/interfaces";
import type { IronSessionOptions } from "iron-session";
import { ironOptions } from "./config";

export const sessionOptions: IronSessionOptions = ironOptions;

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    user?: iUserLogin
  }
}