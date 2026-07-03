import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aliancaRouter from "./alianca";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aliancaRouter);

export default router;
