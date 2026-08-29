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
    // Auth cookies are only usable from a separately hosted frontend when
    // NODE_ENV is "production"; otherwise they go out SameSite=Strict and the
    // browser silently refuses to send them cross-site, which looks exactly
    // like being logged out.
    authCookieMode: isProduction
      ? "SameSite=None; Secure (cross-site OK)"
      : "SameSite=Strict (cross-site cookies WILL NOT be sent)",
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
  return errorResponse(res, {
    statusCode: err.status,
    message: err.message,
  });
  next();
});

module.exports = app;
