const crypto = require("crypto");

const secret = "1b6e494f04edf4ffa168bc0d1183a9b83daa0a354fc96d3ade9efecea137b72c";

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