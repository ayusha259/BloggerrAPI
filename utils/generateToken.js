import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  return jwt.sign({ user_id: payload.id, role: payload.role }, process.env.JWT_CODE, {
    expiresIn: "1d",
  });
};

export { generateToken };
