const crypto = require("crypto");

const secret = "bfddedf81ee35c8dd93e9ac23a915e4cb8fd89dcfa7710c2fc316ce26006f996";

const payload = JSON.stringify({
  "content": "# Hello World\nThis is a markdown content."
});


// should exactly match the payload sent by the webhook sender (frontend)
// here because we are using postman to send the webhook we need to make sure that the payload in 
// postman without spaces and newlines matches the payload here, otherwise the signature will not match
// because JSON.stringify removes spaces and newlines

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

console.log(signature);