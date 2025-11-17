import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret_for_dev";

// Estrategia local para login por email + clave
passport.use("login", new LocalStrategy(
  { usernameField: "email", passwordField: "password", session: false },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "User not found" });
      const valid = user.isValidPassword(password);
      if (!valid) return done(null, false, { message: "Invalid password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Estrategia para proteger rutas y obtener "current"
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use("jwt", new JwtStrategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select("-password");
    if (!user) return done(null, false, { message: "Token user not found" });
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

export default passport;
