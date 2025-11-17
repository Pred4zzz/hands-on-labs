import express from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_for_dev";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "2h";

// Registro
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ status: "error", message: "Email already registered" });

    const user = new User({ first_name, last_name, email, age, password, role });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ status: "success", payload: userObj });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: "error", message: info?.message || "Login failed" });

    const payload = { id: user._id, role: user.role, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ status: "success", payload: { token, user: userObj } });
  })(req, res, next);
});

// Current -> valida JWT y devuelve usuario
router.get("/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user.toObject ? req.user.toObject() : req.user;
    delete user.password;
    res.json({ status: "success", payload: user });
  }
);

export default router;
