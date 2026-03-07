const crypto = require("crypto");

const secret = "aab343148f3ba246665df31545b6349dfd5a094dd2e9d4ac7c22423cf389eecb";

const payload = JSON.stringify({"message":"hello world"}); 
// should exactly match the payload sent by the webhook sender (frontend)
// here because we are using postman to send the webhook we need to make sure that the payload in 
// postman without spaces and newlines matches the payload here, otherwise the signature will not match
// because JSON.stringify removes spaces and newlines

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

console.log(signature);