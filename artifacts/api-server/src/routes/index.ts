import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import siteSettingsRouter from "./site-settings";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(siteSettingsRouter);
router.use(storageRouter);

export default router;
