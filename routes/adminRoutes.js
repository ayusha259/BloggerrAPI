import express from "express";
import Blog, { Category } from "../models/blogModel.js";
import { Joi, validate } from "express-validation";
import { adminAuth } from "../middlewares/auth.js";

const categoryValidator = {
  body: Joi.object({
    title: Joi.string().required(),
  }),
};

const router = express.Router();

router.get("", adminAuth, (req, res, next) => {
  res.send("Admin Route");
});

router.post(
  "/category",
  adminAuth,
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

router.put("/blogs/feature/:slug", adminAuth, async (req, res, next) => {
  try {
    const blog = await Blog.findOne({slug: req.params.slug})
    if(blog.featured === 1) {
      await blog.update({
        featured: 0
      })
      return res.status(200).json({
        status: 200,
        message: "Success removed from featured"
      })
    } else {
      await blog.update({
        featured: 1
      })
      return res.status(200).json({
        status: 200,
        message: "Success added to featured"
      })
    }
  } catch (error) {
    next(error)
  }
})

export default router;
