import { executeAction } from "../worker/actions.processor";

describe("Action Processor", () => {

  test("should uppercase message", () => {

    const payload = { message: "hello" };

    const result = executeAction("uppercase", payload);

    expect(result.message).toBe("HELLO");

  });

  test("should add timestamp", () => {

    const payload = { message: "test" };

    const result = executeAction("add_timestamp", payload);

    expect(result.processedAt).toBeDefined();

  });

  test("should multiply value", () => {

    const payload = { value: 10 };

    const result = executeAction("multiply_value", payload);

    expect(result.value).toBe(20);

  });

});