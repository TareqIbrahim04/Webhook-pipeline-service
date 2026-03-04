import { Router } from "express";
import { receiveWebhook } from "./webhook.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Webhook Endpoint
|--------------------------------------------------------------------------
| POST /api/webhooks/:pipelineId
*/

router.post(
  "/webhooks/:pipelineId",
  receiveWebhook
);

export default router;