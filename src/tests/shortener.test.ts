import request from "supertest";
import app from "../app"; // your Express app
import { pool } from "../config/database";

describe("Shortener API", () => {
  let shortCode: string;

  beforeAll(async () => {
    // insert a test URL into the DB
    const result = await pool.query(
      `INSERT INTO url_shortener (short_code, long_url) 
       VALUES ('test123', 'www.example.com') 
       RETURNING short_code`
    );
    shortCode = result.rows[0].short_code;
  });

  afterAll(async () => {
    // clean up test data
    await pool.query(`DELETE FROM url_shortener WHERE short_code = $1`, [
      shortCode,
    ]);
    await pool.end();
  });

  test("should return long URL with protocol", async () => {
    const response = await request(app).get(`/s/${shortCode}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("longUrl");
    expect(response.body.longUrl).toBe("http://www.example.com"); // adds http if missing
  });

  test("should return 404 if short code not found", async () => {
    const response = await request(app).get("/s/unknowncode");
    expect(response.status).toBe(404);
    expect(response.text).toBe("Short URL not found");
  });
});