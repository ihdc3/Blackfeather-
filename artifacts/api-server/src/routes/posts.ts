import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";
import {
  ListPostsQueryParams,
  CreatePostBody,
  GetPostsSummaryResponse,
  GetPostParams,
  UpdatePostParams,
  UpdatePostBody,
  DeletePostParams,
  ListPostsResponse,
  CreatePostResponse,
  GetPostResponse,
  UpdatePostResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base.length > 0 ? base : "post";
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [existing] = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.slug, candidate));
    if (!existing) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

router.get("/posts", async (req, res): Promise<void> => {
  const query = ListPostsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = query.data.publishedOnly
    ? await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.published, true))
        .orderBy(desc(postsTable.createdAt))
    : await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));

  res.json(ListPostsResponse.parse(rows));
});

router.get("/posts/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(postsTable);
  const publishedCount = rows.filter((r) => r.published).length;
  const draftCount = rows.length - publishedCount;
  const latestPost =
    rows
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
    null;

  res.json(
    GetPostsSummaryResponse.parse({
      totalPosts: rows.length,
      publishedCount,
      draftCount,
      latestPost,
    }),
  );
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug = await generateUniqueSlug(parsed.data.title);

  const [post] = await db
    .insert(postsTable)
    .values({ ...parsed.data, slug })
    .returning();

  res.status(201).json(CreatePostResponse.parse(post));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, params.data.id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(GetPostResponse.parse(post));
});

router.patch("/posts/:id", async (req, res): Promise<void> => {
  const params = UpdatePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateValues: Partial<typeof postsTable.$inferInsert> = {
    ...parsed.data,
  };
  if (parsed.data.title != null) {
    updateValues.slug = await generateUniqueSlug(parsed.data.title);
  }

  const [post] = await db
    .update(postsTable)
    .set(updateValues)
    .where(eq(postsTable.id, params.data.id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(UpdatePostResponse.parse(post));
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .delete(postsTable)
    .where(eq(postsTable.id, params.data.id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
