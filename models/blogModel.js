import mongoose from "mongoose";
import URLSlug from "mongoose-slug-generator";

mongoose.plugin(URLSlug);

const categorySchema = mongoose.Schema({
  title: String,
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
});

export const Category = mongoose.model("Category", categorySchema);

const tagSchema = mongoose.Schema({
  title: String,
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
});

export const Tag = mongoose.model("Tag", tagSchema);

const commentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    blog: {
      type: mongoose.Types.ObjectId,
      ref: "Blog",
    },
    body: String,
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);

const blogSchema = mongoose.Schema(
  {
    title: String,
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    body: String,
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    cover_image: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    tags: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Tag",
      },
    ],
    featured: {
      type: Number,
      default: 0,
      enum: [1, 0]
    }
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
