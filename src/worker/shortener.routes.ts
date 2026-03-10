import { Router } from "express";
import { pool } from "../config/database";

const router = Router();

router.get("/s/:code", async (req, res) => {
  const { code } = req.params;

  const result = await pool.query(
    `SELECT long_url FROM url_shortener WHERE short_code=$1`,
    [code]
  );

  if (!result.rows.length) {
    return res.status(404).send("Short URL not found");
  }

  let longUrl = result.rows[0].long_url;

  // ensure it has a protocol
  if (!/^https?:\/\//i.test(longUrl)) {
    longUrl = 'http://' + longUrl;
  }

  //res.redirect(longUrl);
  res.status(200).json({ longUrl });
});

export default router;
