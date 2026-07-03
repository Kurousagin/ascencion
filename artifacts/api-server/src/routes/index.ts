import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aliancaRouter from "./alianca";
import guerraRouter from "./guerra";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aliancaRouter);
router.use(guerraRouter);

export default router;
