import mongoose from "mongoose";
import { compareSync } from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    blogs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Blog",
      },
    ],
    profile: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    following: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    comment_requests: [
      {
        comment_id: {
          type: mongoose.Types.ObjectId,
          ref: "Comment",
        },
        read: {
          type: Boolean,
          default: false,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    saved_blogs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Blog",
      },
    ],
  },
  { timestamps: true }
);
userSchema.methods.comparePasswords = function (password) {
  return compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
