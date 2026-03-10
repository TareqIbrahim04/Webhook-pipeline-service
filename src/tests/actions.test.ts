import { executeAction } from "../worker/actions.processor";

describe("Action Processor", () => {
  test("should uppercase message", async () => {
    const payload = { message: "hello" };

    const result = await executeAction("uppercase", payload);

    expect(result.message).toBe("HELLO");
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
