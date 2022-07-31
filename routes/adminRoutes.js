import express from "express";
import { Category } from "../models/blogModel.js";
import { Joi, validate } from "express-validation";

const categoryValidator = {
  body: Joi.object({
    title: Joi.string().required(),
  }),
};

const router = express.Router();

router.get("", (req, res, next) => {
  res.send("Admin Route");
});

router.post(
  "/category",
  validate(categoryValidator, {}, {}),
  async (req, res, next) => {
    try {
      const { title } = req.body;
      const exists = await Category.exists({ title: title });
      if (exists) {
        res.status(400);
        throw new Error("Category already exists");
      }
      const newCategory = Category({
        title: title,
      });
      newCategory.save();
      res.json({
        data: {
          title: newCategory.title,
          slug: newCategory.slug,
        },
        status: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
