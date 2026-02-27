import { UserJWT } from "./UserJwt";

declare global {
  namespace Express {
    interface Request {
      user: UserJWT;
    }
  }
}
