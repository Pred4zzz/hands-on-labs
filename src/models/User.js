import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  age: { type: Number, default: null },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Carts", default: null },
  role: { type: String, default: "user" }
}, { timestamps: true });

// Comparar clave (instancia)
userSchema.methods.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Pre-guardado: hashear si la password fue modificada o es nueva
userSchema.pre("save", function(next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
  next();
});

const User = model("User", userSchema);
export default User;
