import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aliancaRouter from "./alianca";
import guerraRouter from "./guerra";
import pioneerRouter from "./pioneer";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aliancaRouter);
router.use(guerraRouter);
router.use(pioneerRouter);

export default router;
