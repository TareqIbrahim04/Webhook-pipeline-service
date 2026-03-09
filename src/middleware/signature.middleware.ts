import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { pool } from "../config/database";

export async function signatureMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const pipelineId = req.params.pipelineId;
  const receivedSignature = req.header("X-Webhook-Signature");

  if (!receivedSignature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const result = await pool.query(
    `
        SELECT secret
        FROM pipelines
        WHERE id = $1
        AND deleted_at IS NULL
        `,
    [pipelineId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Pipeline not found" });
  }

  const secret = result.rows[0].secret;

  // avoiding TS issues (express doesn't have rawBody by default)
  const rawBody = (req as any).rawBody;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody || "") // was req.rawBody
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}
