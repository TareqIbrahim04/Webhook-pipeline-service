import { executeAction } from "../worker/actions.processor";

describe("Action Processor", () => {
  test("should generate qr code url", async () => {
    const payload = { url: "https://example.com" };

    const result = await executeAction("generate_qr", payload);

    expect(result.qrCodeUrl).toContain("api.qrserver.com");
    expect(result.qrCodeUrl).toContain(encodeURIComponent(payload.url));
  });

  test("should fail if url missing for qr", async () => {
    const payload = {};

    await expect(executeAction("generate_qr", payload)).rejects.toThrow(
      "url field is required for generate_qr action"
    );
  });

  test("should convert markdown to html", async () => {
    const payload = { content: "# Hello" };

    const result = await executeAction("markdown_to_html", payload);

    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Hello");
  });

  test("should fail if content missing", async () => {
    const payload = {};

    await expect(executeAction("markdown_to_html", payload)).rejects.toThrow(
      "content field is required for markdown_to_html action"
    );
  });

  test("should add timestamp", async () => {
    const payload = { message: "test" };

    const result = await executeAction("add_timestamp", payload);

    expect(result.processedAt).toBeDefined();
    expect(typeof result.processedAt).toBe("string");
  });

  test("should shorten url", async () => {
    const payload = { url: "https://example.com/very/long/url" };

    const result = await executeAction("shorten_url", payload);

    expect(result.shortUrl).toContain("/s/");
    expect(result.shortCode).toBeDefined();
  });

  test("should fail if url missing", async () => {
    const payload = {};

    await expect(executeAction("shorten_url", payload)).rejects.toThrow(
      "url field is required for shorten_url action"
    );
  });

  test("should ignore unknown action", async () => {
    const payload = { message: "hello" };
    const warnMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await executeAction("unknown_action", payload);
    // console.warn called
    expect(warnMock).toHaveBeenCalled();

    expect(warnMock).toHaveBeenCalledWith("Unknown action:", "unknown_action");
    expect(result).toEqual(payload);
  });
});
