const serverless = require("serverless-http");
const app = require("../../server");
const { connectDB } = require("../../server");

// Ensure MongoDB is connected before handling requests
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Reuse DB connection across warm invocations
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return handler(event, context);
};
