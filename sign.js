const crypto = require("crypto");

const secret = "44fea9ae8559c6111854ca408cff6227ac479a8df01e2f6a1dd50589c2317536";

const payload = JSON.stringify({"url1":"www.google.com"}); 
// should exactly match the payload sent by the webhook sender (frontend)
// here because we are using postman to send the webhook we need to make sure that the payload in 
// postman without spaces and newlines matches the payload here, otherwise the signature will not match
// because JSON.stringify removes spaces and newlines

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

console.log(signature);