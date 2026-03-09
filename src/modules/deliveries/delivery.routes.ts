import { Router } from "express";
import { getAllDeliveries } from "./delivery.controller";

const router = Router();

router.get("/deliveries", getAllDeliveries);

export default router;
