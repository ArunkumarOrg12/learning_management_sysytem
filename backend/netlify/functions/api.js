const serverless = require("serverless-http");
const app = require("../../server");

// Wrap the Express app as a Netlify serverless function.
// All requests to /api/* are routed here by netlify.toml.
module.exports.handler = serverless(app);
