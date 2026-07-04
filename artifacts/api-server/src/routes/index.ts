import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aliancaRouter from "./alianca";
import guerraRouter from "./guerra";
import pioneerRouter from "./pioneer";
import primordialRouter from "./primordial";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aliancaRouter);
router.use(guerraRouter);
router.use(pioneerRouter);
router.use(primordialRouter);

export default router;
