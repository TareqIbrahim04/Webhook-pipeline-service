export function executeAction(actionName: string, payload: any) {
  switch (actionName) {
    case "uppercase":
      if (payload.message) {
        payload.message = payload.message.toUpperCase();
      }
      break;

    case "add_timestamp":
      payload.processedAt = new Date().toISOString();
      break;

    case "multiply_value":
      if (payload.value) {
        payload.value *= 2;
      }
      break;

    default:
      console.warn("Unknown action:", actionName);
  }

  return payload;
}
