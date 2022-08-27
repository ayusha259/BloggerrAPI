import express from "express";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { Joi, validate } from "express-validation";
import auth from "../middlewares/auth.js";
import Blog from "../models/blogModel.js";
import { hash, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

const signUpValidator = {
  body: Joi.object({
    name: Joi.string().required(),
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
  }),
};

const loginValidator = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
  }),
};

const router = express.Router();

router.get("", auth, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 10;
    const sort = req.query.sort || "-createdAt";
    const allUsersCount = User.find().count();
    if (page <= 0 || page > Math.ceil(allUsersCount / per_page)) {
      res.status(400);
      throw new Error("Page number is out of bounds");
    }
    const allUsers = await User.find()
      .select("-password")
      .skip(per_page * (page - 1))
      .limit(per_page)
      .sort(sort);

    res.status(200).json({
      data: allUsers,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/signup",
  validate(signUpValidator, {}, {}),
  async (req, res, next) => {
    try {
      const { username, name, password, email } = req.body;
      const useranemExists = await User.exists({ username: username });
      if (useranemExists) {
        res.status(400);
        throw new Error("User with this username already exists");
      }

      const emailExists = await User.exists({ email: email });
      if (emailExists) {
        res.status(400);
        throw new Error("User with this email already exists");
      }

      const hashedPassword = hashSync(password, 10);

      const newUser = User({
        username,
        name,
        password: hashedPassword,
        email,
      });

      newUser.save();

      const token = generateToken(newUser.id);
      const decodeToken = jwt.decode(token);

      res.json({
        data: {
          user_id: newUser._id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          profile: newUser.profiel.url,
          token: token,
          expiresIn: decodeToken.exp,
        },
        status: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  validate(loginValidator, {}, {}),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({
        $or: [{ username: username }, { email: username }],
      });
      if (!user) {
        res.status(400);
        throw new Error("Email or username is invalid.");
      }
      const passwordMatch = user.comparePasswords(password);
      if (passwordMatch) {
        const token = generateToken(user.id);
        const decodeToken = jwt.decode(token);
        res.json({
          data: {
            user_id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profile: user.profile.url,
            token: token,
            expiresIn: decodeToken.exp,
          },
          status: 200,
        });
      } else {
        throw new Error("Password is incorrect.");
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get("/details", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const user = await User.findById(user_id).select("-password");
    res.json({
      data: user,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/blogs", auth, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const per_page = Number(req.query.per_page) || 10;
    const sort = req.query.sort || "-createdAt";
    const user_id = req.user;
    const user_blogs_count = await Blog.find({ user: user_id }).count();
    if (page <= 0 || page > Math.ceil(user_blogs_count / per_page)) {
      res.status(400);
      throw new Error("Page number is out of bounds");
    }
    const user_blogs = await Blog.find({ user: user_id })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .sort(sort);

    res.status(200).json({
      data: user_blogs,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/follow", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const target_id = req.body.target;
    if (user_id === target_id) {
      res.status(400);
      throw new Error("Target and user are same");
    }
    await User.findByIdAndUpdate(user_id, {
      $addToSet: { following: target_id },
    });
    await User.findByIdAndUpdate(target_id, {
      $addToSet: { followers: user_id },
    });
    res.status(200).json({
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/unfollow", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const target_id = req.body.target;
    if (user_id === target_id) {
      res.status(400);
      throw new Error("Target and user are same");
    }
    await User.findByIdAndUpdate(user_id, {
      $pull: { following: target_id },
    });
    await User.findByIdAndUpdate(target_id, {
      $pull: { followers: user_id },
    });
    res.status(200).json({
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/update", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const user = await User.findById(user_id);
    const name = req.body.name || user.name;
    const profile_url = req.body.image_url || user.profile.url;
    await user.update({
      name: name,
      profile: { url: profile_url, public_id: "" },
    });
    await user.save();
    res.status(200).json({
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/savedblogs", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const user = await User.findById(user_id).populate({
      path: "saved_blogs",
      options: {
        select: "user title body slug createdAt category, cover_image",
      },
      populate: [
        { path: "user", options: { select: "profile name username" } },
        { path: "category", options: { select: "title slug" } },
      ],
    });
    const blogs = user["saved_blogs"];
    res.status(200).json({
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/savedblogs/:slug/:type", auth, async (req, res, next) => {
  try {
    const user_id = req.user;
    const slug = req.params.slug;
    const type = req.params.type;
    if (!(type === "save" || type === "unsave")) {
      res.status(400);
      throw new Error("Operation type can either be 'save' or 'unsave'");
    }
    const user = await User.findById(user_id);
    const blog = await Blog.findOne({ slug: slug });
    if (!blog) {
      res.status(404);
      throw new Error("Blog Not Found");
    }
    if (type === "save") {
      await user.update({
        $set: {
          saved_blogs: blog._id,
        },
      });
    } else if (type === "unsave") {
      await user.update({
        $pull: {
          saved_blogs: blog._id,
        },
      });
    }
    res.status(200).json({
      message: type === "save" ? "Blog Saved" : "Blog Unsaved",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:username", auth, async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username })
      .select("-password")
      .populate({
        path: "blogs",
        options: { sort: { createdAt: -1 } },
      })
      .populate("followers", "username profile name", "User")
      .populate("following", "username profile name", "User");
    if (!user) {
      res.status(404);
      throw new Error("User with this username was not found");
    }
    res.status(200).json({
      data: user,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
