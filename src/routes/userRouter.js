import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import passport from "../config/passport.js";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";
import Ticket from "../models/ticket.js";
import { authorize } from "../middlewares/authorization.js";


const router = Router();

// GET lista
router.get('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

// POST crear 
router.post('/', async (req, res) => {
    const { first_name, last_name, email, age, password, role } = req.body;
    try {
        if (!email || !password) return res.status(400).send({ status: 'error', message: 'Email and password required' });
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).send({ status: 'error', message: 'Email already exists' });
        const hash = bcrypt.hashSync(password, 10);
        const newUser = await User.create({ first_name, last_name, email, age, password: hash, role });
        const u = newUser.toObject(); delete u.password;
        res.status(201).send({ status: 'success', payload: u });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// GET por id 
router.get('/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).send({ status: 'error', message: 'Not found' });
        res.send({ status: 'success', payload: user });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

// PUT actualizar
router.put('/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.password) {
            payload.password = bcrypt.hashSync(payload.password, 10);
        }
        const result = await User.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password");
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// DELETE 
router.delete('/:id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.send({ status: 'success', message: 'User deleted' });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// POST agregar producto al carrito (SOLO USER)
router.post(
  "/cart",
  passport.authenticate("jwt", { session: false }),
  authorize(["user"]),
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({
          user: req.user._id,
          products: []
        });
      }

      cart.products.push({ product: productId, quantity });
      await cart.save();

      res.send({ status: "success", payload: cart });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);

// POST compra carrito (SOLO USER)
router.post(
  "/purchase",
  passport.authenticate("jwt", { session: false }),
  authorize(["user"]),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

      if (!cart || cart.products.length === 0) {
        return res.status(400).send({ status: "error", message: "Carrito vacío" });
      }

      let total = 0;
      const remainingProducts = [];

      for (const item of cart.products) {
        if (item.product.stock >= item.quantity) {
          item.product.stock -= item.quantity;
          await item.product.save();
          total += item.product.price * item.quantity;
        } else {
          remainingProducts.push(item);
        }
      }

      const ticket = await Ticket.create({
        amount: total,
        purchaser: req.user.email
      });

      cart.products = remainingProducts;
      await cart.save();

      res.send({
        status: "success",
        ticket,
        remainingProducts
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);

export default router;
