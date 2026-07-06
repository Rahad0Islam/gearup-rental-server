import cookieParser from "cookie-parser";
import { Application } from "express";
import express from "express";
import cors from "cors";
import config from "./config/config";
import { authRouter } from "./module/auth/auth.router";
import { providerRouter } from "./module/provider/provider.router";
import { adminRouter } from "./module/admin/admin.router";


const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.send("Hello World!");
});


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/provider', providerRouter);
app.use('/api/v1/admin', adminRouter);

export default app;
