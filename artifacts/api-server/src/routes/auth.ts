import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { GetAuthMeResponse } from "@workspace/api-zod";
import { isAdminRequest } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const isSignedIn = !!auth?.userId;
  const isAdmin = isSignedIn && (await isAdminRequest(req));

  res.json(GetAuthMeResponse.parse({ isSignedIn, isAdmin }));
});

export default router;
