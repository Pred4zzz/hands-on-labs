import express from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import UserDTO from "../dto/UserDTO.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import PasswordReset from "../models/passwordReset.js";


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
    const userDTO = new UserDTO(req.user);
res.json({ status: "success", payload: userDTO });

  }
);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send({ error: "Usuario no encontrado" });
  }

  const token = crypto.randomBytes(20).toString("hex");

  await PasswordReset.create({
    userId: user._id,
    token,
    expiresAt: Date.now() + 60 * 60 * 1000 // 1 hora
  });

  // MAIL SIMULADO 
  console.log(`Reset password: http://localhost:8080/reset/${token}`);

  res.send({ status: "success", message: "Correo enviado" });
});

router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;

  const record = await PasswordReset.findOne({
    token: req.params.token,
    expiresAt: { $gt: Date.now() }
  });

  if (!record) {
    return res.status(400).send({ error: "Token inválido o expirado" });
  }

  const user = await User.findById(record.userId);

  const samePassword = bcrypt.compareSync(password, user.password);
  if (samePassword) {
    return res.status(400).send({ error: "No puede usar la misma contraseña" });
  }

  user.password = bcrypt.hashSync(password, 10);
  await user.save();

  await PasswordReset.deleteMany({ userId: user._id });

  res.send({ status: "success", message: "Contraseña actualizada" });
});



export default router;
