import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import connectDB from "./utils/database.js";
import { notFound, errHandler } from "./middlewares/errHandler.js";

dotenv.config();

const app = express();

connectDB();

app.disable("x-powered-by");

app.use(express.json());

const apiRoutes = express.Router();

app.get("", (req, res) => {
  res.json({
    message: "This is a bloggerr app api",
  });
});

apiRoutes.get("", (req, res) => {
  res.json({
    messge: "Blogger API",
  });
});

app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

apiRoutes.use("/users", userRoutes);
apiRoutes.use("/blogs", blogRoutes);

app.use(notFound);
app.use(errHandler);

app.listen(process.env.PORT, () => {
  console.log("Server started!");
});

export default app;
