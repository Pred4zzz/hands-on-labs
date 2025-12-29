import { Router } from "express";
import passport from "passport";
import Product from "../models/Product.js";
import { authorize } from "../middlewares/authorization.js";

const router = Router();

// Crear producto - SOLO ADMIN
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  async (req, res) => {
    const product = await Product.create(req.body);
    res.send(product);
  }
);

// Actualizar producto - SOLO ADMIN
router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  async (req, res) => {
    const updated = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true }
    );
    res.send(updated);
  }
);

// Eliminar producto - SOLO ADMIN
router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  async (req, res) => {
    await Product.findByIdAndDelete(req.params.pid);
    res.send({ status: "success" });
  }
);

// Obtener productos - PUBLICO
router.get("/", async (req, res) => {
  res.send(await Product.find());
});

export default router;
