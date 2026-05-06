import { prisma } from "../config/db.js";
import { calculateBorrowLimit } from "../services/collateral.service.js";

// créer ou récupérer user
export async function connectUser(req, res) {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ error: "Wallet required" });
    }

    let user = await prisma.user.findUnique({
      where: { wallet }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { wallet }
      });
    }

    return res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// déposer du collateral
export async function deposit(req, res) {
  try {
    const { wallet, amount } = req.body;

    if (!wallet || !amount) {
      return res.status(400).json({ error: "Missing data" });
    }

    const user = await prisma.user.findUnique({
      where: { wallet }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBalance = user.balance + amount;

    const updated = await prisma.user.update({
      where: { wallet },
      data: { balance: newBalance }
    });

    const limit = calculateBorrowLimit(newBalance);

    return res.json({
      balance: updated.balance,
      borrowLimit: limit
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}