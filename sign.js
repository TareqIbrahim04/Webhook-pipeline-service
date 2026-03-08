const crypto = require("crypto");

const secret = "1f0eff17ecc6fcc81e803b287aa406a51d41e10345cc4ad7cf9f99218f844383";

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