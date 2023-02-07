import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import connectDB from "./utils/database.js";
import { notFound, errHandler } from "./middlewares/errHandler.js";
import cors from "cors";

dotenv.config();

const app = express();

connectDB();

app.disable("x-powered-by");
app.use(express.json());
app.use(cors());

const apiRoutes = express.Router();

app.get("", (req, res) => {
  res.redirect("/api");
});

apiRoutes.get("", (req, res) => {
  res.json({
    messge: "Blogger API for playing with different frameworks",
  });
});

app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

apiRoutes.use("/users", userRoutes);
apiRoutes.use("/blogs", blogRoutes);

app.use(notFound);
app.use(errHandler);

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}!`);
});
