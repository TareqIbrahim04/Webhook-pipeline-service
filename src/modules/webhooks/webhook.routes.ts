import { Router } from "express";
import { receiveWebhook } from "./webhook.controller";
import { signatureMiddleware } from "../../middleware/signature.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Webhook Endpoint
|--------------------------------------------------------------------------
| POST /api/webhooks/:pipelineId
*/

router.post(
  "/webhooks/:pipelineId",
  signatureMiddleware,
  receiveWebhook
);

export default router;