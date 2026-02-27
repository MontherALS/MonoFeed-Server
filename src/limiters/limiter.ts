import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: 150,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, //5min
  max: 15,
  message: { message: "Too many requests. Please try again in a few minutes." },
  standardHeaders: true,
});

export const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 20,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
});

export const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 50,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
});