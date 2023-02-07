import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        let token = req.headers.authorization.split(" ")[1];
        const decodeToken = jwt.verify(token, process.env.JWT_CODE);
        req.user = decodeToken.user_id;
        next();
      } catch (err) {
        res.status(401);
        throw new Error("Token is invalid, Not authorized");
      }
    } else {
      res.status(401);
      throw new Error("No token, Not authorized");
    }
  } catch (err) {
    next(err);
  }
};

export const adminAuth = (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        let token = req.headers.authorization.split(" ")[1];
        const decodeToken = jwt.verify(token, process.env.JWT_CODE);
        if(decodeToken.role !== "admin") {
          res.status(401);
          throw new Error("User is not an Admin!")
        }
        req.user = decodeToken.user_id;
        next();
      } catch (err) {
        res.status(401);
        throw new Error("Token is invalid, Not authorized");
      }
    } else {
      res.status(401);
      throw new Error("No token, Not authorized");
    }
  } catch (err) {
    next(err);
  }
}

export default auth;
