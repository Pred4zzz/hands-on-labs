
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  code: String,
  amount: Number,
  purchaser: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Ticket", ticketSchema);
