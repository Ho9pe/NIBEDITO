const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const userRouter = require("./routers/userRouter");
const authRouter = require("./routers/authRouter");
const adminRouter = require("./routers/adminRouter");
const categoryRouter = require("./routers/categoryRouter");
const subcategoryRouter = require("./routers/subcategoryRouter");
const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const wishlistRouter = require("./routers/wishlistRouter");
const { errorResponse } = require("./controllers/responseController");
const couponRouter = require("./routers/couponRouter");
const orderRouter = require("./routers/orderRouter");
const shippingRouter = require("./routers/shippingRouter");
const paymentRouter = require("./routers/paymentRouter");
const faqRouter = require("./routers/faqRouter");
const secret = require("./secret");
const logger = require("./helper/logger");
const reviewRouter = require("./routers/reviewRouter");

const app = express();
app.set("trust proxy", 1);

app.use(morgan(secret.nodeEnv === "production" ? "combined" : "dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: secret.clientURL,
    credentials: true,
  })
);

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: "Too many requests, Please try again later",
});
app.use(rateLimiter);

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/subcategories", subcategoryRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/shipping", shippingRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/faqs", faqRouter);
app.use("/api/reviews", reviewRouter);

// Liveness probe for the platform health check. This stays 200 whenever the
// process can still serve requests: database state is reported in the body
// rather than as a failing status, so a transient Atlas outage does not make
// the host restart a server that is otherwise healthy.
const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting"];
app.get("/health", (req, res) => {
  const isProduction = secret.nodeEnv === "production";
  res.status(200).send({
    success: true,
    status: "ok",
    database: DB_STATES[mongoose.connection.readyState] || "unknown",
    uptime: Math.floor(process.uptime()),
    environment: secret.nodeEnv || "(unset)",
    // Cookies go out SameSite=Lax in both cases; NODE_ENV only decides the
    // Secure flag. Nginx serves the frontend and the API from one origin, so
    // the browser treats every API call as same-site and Lax is enough for it
    // to send them - while still refusing to attach them to a cross-site
    // request, which is what stops a form on another domain from acting as the
    // signed-in user. Secure over plain http would mean the cookie is never
    // stored at all, hence the switch rather than a constant.
    authCookieMode: isProduction
      ? "SameSite=Lax; Secure"
      : "SameSite=Lax (no Secure flag; plain http locally)",
  });
});

app.get("/test", (req, res) => {
  res.status(200).send({
    message: "Test is working",
  });
});

// Client Error Handling
app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});
// Server Error Handling
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  // Nothing used to log here, so a 500 in production left no trace anywhere:
  // no stack, no message, nothing in `docker compose logs api`. Server faults
  // get the whole error because that is what you need when one wakes you up.
  // Client errors are ordinary traffic - a wrong password, a stale coupon -
  // and logging them at the same level would bury the faults, so they stay at
  // debug.
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  } else {
    logger.debug(
      `${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`
    );
  }

  // Mongoose schema validation reaching this point means a request body got
  // past the express-validator rules. The message is written for a person and
  // is safe to pass on, but the status was 500, which told the client the
  // request was fine and the server was broken. It is a 400.
  if (err.name === "ValidationError" && err.errors) {
    return errorResponse(res, {
      statusCode: 400,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // http-errors sets `expose` on the errors whose message was written for the
  // client, which here means everything raised with createError. Anything else
  // is an internal fault, and its message is a driver or Mongoose string that
  // can name collections, fields and connection targets - so it is replaced
  // rather than forwarded. The real one is in the log line above.
  return errorResponse(res, {
    statusCode,
    message: err.expose ? err.message : "Internal Server Error",
  });
});

module.exports = app;
