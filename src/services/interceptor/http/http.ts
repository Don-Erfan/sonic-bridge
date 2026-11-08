import HttpClient from "./client";
import { AuthMiddleware, ErrorMiddleware } from "./middlewares";

const baseURL = process.env.NEXT_PUBLIC_BASE_API
  ? `${process.env.NEXT_PUBLIC_BASE_API}/`
  : "/";

const appClient = new HttpClient({
  baseURL,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

// Order matters: AuthMiddleware must see 401s first so it can refresh and
// retry before ErrorMiddleware decides the request has truly failed.
appClient.use(new AuthMiddleware(), new ErrorMiddleware()).boot();

export { appClient, baseURL };