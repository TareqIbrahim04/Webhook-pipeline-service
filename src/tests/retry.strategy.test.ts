import { calculateBackoffDelay } from "../worker/retry.strategy";

describe("Retry Strategy", () => {

  test("should calculate exponential backoff", () => {

    expect(calculateBackoffDelay(1)).toBe(2000);
    expect(calculateBackoffDelay(2)).toBe(4000);
    expect(calculateBackoffDelay(3)).toBe(8000);

  });

});