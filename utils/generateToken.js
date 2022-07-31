import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  return jwt.sign({ user_id: payload }, process.env.JWT_CODE, {
    expiresIn: "1d",
  });
};

export { generateToken };
