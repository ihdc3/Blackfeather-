import type { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();

/**
 * Non-blocking check for whether the current request is from the admin
 * account. Unlike requireAdmin, this never rejects the request -- it's used
 * to decide what data to include in otherwise-public responses (e.g.
 * hiding draft posts from non-admin visitors).
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  if (!ADMIN_EMAIL) return false;

  const auth = getAuth(req);
  if (!auth?.userId) return false;

  try {
    const user = await clerkClient.users.getUser(auth.userId);
    return user.emailAddresses.some(
      (e) => e.emailAddress.toLowerCase() === ADMIN_EMAIL,
    );
  } catch {
    return false;
  }
}

/**
 * Restricts write actions (creating/editing/deleting posts, changing site
 * settings, uploading images) to a single owner account, identified by the
 * ADMIN_EMAIL environment variable. This app has no general user system --
 * everyone can read, only the owner can write.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!ADMIN_EMAIL) {
    req.log.error(
      "ADMIN_EMAIL is not configured; refusing all admin actions",
    );
    res.status(500).json({ error: "Admin account is not configured" });
    return;
  }

  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const emails = user.emailAddresses.map((e) =>
      e.emailAddress.toLowerCase(),
    );
    if (!emails.includes(ADMIN_EMAIL)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  } catch (error) {
    req.log.error({ err: error }, "Failed to verify admin user");
    res.status(500).json({ error: "Failed to verify user" });
    return;
  }

  next();
}
