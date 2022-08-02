import express from "express";
import Blog, { Category, Comment } from "../models/blogModel.js";
import auth from "../middlewares/auth.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/create", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const user = await User.findById(user_id);
    if (!user) {
      res.send(500);
      throw new Error("Something went wrong");
    }
    const { title, body, image_url, category } = req.body;

    if (!title || !body || !image_url || !category) {
      res.status(400);
      throw new Error("All fields are required");
    }
    const newBlog = await Blog.create({
      title: title,
      body: body,
      user: user_id,
      category: category,
      cover_image: {
        url: image_url,
        public_id: "",
      },
    });

    await User.findByIdAndUpdate(user_id, {
      $push: { blogs: newBlog._id },
    });

    res.status(200).json({
      data: "Blog created",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.get("", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 10;
    const sort = req.query.sort || "-createdAt";
    const category = req.query.category || "all";

    const allBlogsCount = await Blog.find().count();
    if (page <= 0 || page > Math.ceil(allBlogsCount / per_page)) {
      res.status(400);
      throw new Error("Page number is out of bounds");
    }
    let categoryItem;
    if (category !== "all") {
      categoryItem = await Category.findOne({ slug: category });
      if (!categoryItem) {
        res.status(400);
        throw new Error("No category found");
      }
    }

    const allBlogs = await Blog.find(
      category === "all" ? {} : { category: categoryItem._id }
    )
      .select("user title body slug createdAt category, cover_image")
      .populate("user", "username profile name")
      .populate("category", "title slug")
      .skip(per_page * (page - 1))
      .limit(per_page)
      .sort(sort);

    res.json({
      data: allBlogs,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/category-list", async (req, res, next) => {
  try {
    const allCategories = await Category.find({});
    res.status(200).json({
      data: allCategories,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const blog_slug = req.params.slug;
    const blog = await Blog.findOne({ slug: blog_slug });
    if (!blog) {
      res.status(404);
      throw new Error("No Blog Found");
    }
    res.status(200).json({
      data: blog,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:slug", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      res.status(400);
      throw new Error("Blog does not exists");
    }

    if (blog.user.toString() === user_id.toString()) {
      await Blog.findOneAndDelete({ slug: req.params.slug });
      await Comment.deleteMany({ blog: blog._id });
    } else {
      res.status(400);
      throw new Error("You are not authorized");
    }
    res.status(200).json({
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/comments/:slug", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      res.status(400);
      throw new Error("The blog does not exists");
    }
    let comments;
    if (blog.user.toString() === user_id.toString()) {
      comments = await Comment.find({ blog: blog._id })
        .populate("user", "username name profile")
        .sort("-createdAt");
    } else {
      comments = await Comment.find({ blog: blog._id, approved: { $eq: true } })
        .populate("user", "username name profile")
        .sort("-createdAt");
    }
    res.status(200).json({
      data: comments,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/comments/:slug", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      res.status(400);
      throw new Error("The blog does not exists");
    }
    const newComment = await Comment.create({
      blog: blog._id,
      user: user_id,
      body: req.body.body,
    });
    await blog.update({
      $push: { comments: newComment._id },
    });
    await blog.save();
    await User.findByIdAndUpdate(blog.user, {
      $push: { comment_requests: { comment_id: newComment._id } },
    });

    res.status(200).json({
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/comments/approve/:id", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(400);
      throw new Error("The comment does not exists");
    }
    const blog = await Blog.findById(comment.blog);
    if (!blog) {
      res.status(400);
      throw new Error("Blog not found");
    }
    if (blog.user.toString() === user_id.toString()) {
      await comment.update({
        approved: true,
      });
      await comment.save();
    } else {
      res.status(400);
      throw new Error("Blog does not belongs to the current user");
    }
    res.status(200).json({
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
