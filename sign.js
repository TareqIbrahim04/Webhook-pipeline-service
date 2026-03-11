const crypto = require("crypto");

const secret = "44f888631d0e4906a3d0ee1c303fe11e23079bd9d5bb73d66ee52f6dcfd51c2f";

const payload = JSON.stringify({"url":"www.google.com"});


// should exactly match the payload sent by the webhook sender (frontend)
// here because we are using postman to send the webhook we need to make sure that the payload in 
// postman without spaces and newlines matches the payload here, otherwise the signature will not match
// because JSON.stringify removes spaces and newlines

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

console.log(signature);