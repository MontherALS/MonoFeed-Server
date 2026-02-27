import express from "express";
import authRouter from "./routers/authRouter";
import postRouter from "./routers/postRouter";
import profileRouter from "./routers/profileRouter";
import categoryRouter from "./routers/categoryRouter";
import errorHandler from "./middleware/error-handler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./limiters/limiter";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const app = express();

app.use(globalLimiter);
app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

app.use("/posts", postRouter);

app.use("/profiles", profileRouter);

app.use("/categories", categoryRouter);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
