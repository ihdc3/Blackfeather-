import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import {
  GetSiteSettingsResponse,
  UpdateSiteSettingsBody,
  UpdateSiteSettingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const [existing] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.id, 1));

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(siteSettingsTable)
    .values({ id: 1 })
    .returning();

  return created;
}

router.get("/site-settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(GetSiteSettingsResponse.parse(settings));
});

router.patch("/site-settings", async (req, res): Promise<void> => {
  const parsed = UpdateSiteSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await getOrCreateSettings();

  const [settings] = await db
    .update(siteSettingsTable)
    .set(parsed.data)
    .where(eq(siteSettingsTable.id, 1))
    .returning();

  res.json(UpdateSiteSettingsResponse.parse(settings));
});

export default router;
