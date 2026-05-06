const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

require("dotenv").config();

const express = require("express");
const router = express.Router();
const { Connection } = require("@solana/web3.js");

const connection = new Connection(
  process.env.HELIUS_RPC,
  "confirmed"
);

// ⚠️ wallet qui reçoit les dépôts
const RECEIVER = "B5dcB68cG6CBtpL4FxMHo9j3wLbkfwhDYfbcUetzVqNt";

router.post("/confirm", async (req, res) => {
  try {
    const { wallet, signature } = req.body;

    if (!wallet || !signature) {
      return res.json({ success: false, error: "Missing params" });
    }

    let tx = null;

    // ⏳ retry pour attendre la propagation
    for (let i = 0; i < 10; i++) {
      tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });

      if (tx) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!tx) {
      return res.json({ success: false, error: "TX not found" });
    }

    if (!tx.meta || tx.meta.err !== null) {
      return res.json({ success: false, error: "TX failed" });
    }

    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    let amount = 0;
    let valid = false;

    const pre = tx.meta.preTokenBalances || [];
    const post = tx.meta.postTokenBalances || [];

    for (let i = 0; i < post.length; i++) {
      const postToken = post[i];
      const preToken = pre.find(p => p.accountIndex === postToken.accountIndex);

      // ✅ uniquement USDC
      if (postToken.mint !== USDC_MINT) continue;

      // ✅ vérifier que TU reçois
      if (postToken.owner !== RECEIVER) continue;

      const preAmount = preToken?.uiTokenAmount?.uiAmount || 0;
      const postAmount = postToken.uiTokenAmount?.uiAmount || 0;

      const diff = postAmount - preAmount;

      if (diff > 0) {
        amount = diff;
        valid = true;
        break;
      }
    }

    if (!valid) {
      return res.json({ success: false, error: "Invalid USDC transfer" });
    }

    if (amount < 1) {
      return res.json({ success: false, error: "Minimum 1 USDC" });
    }

    console.log("USDC Deposit OK:", wallet, amount);

    // 👤 récupérer ou créer user
    let user = await prisma.user.findUnique({
      where: { wallet }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { wallet, balance: 0 }
      });
    }

    // 🧾 enregistrer transaction FIRST (ANTI DOUBLE SPEND)
    try {
      await prisma.transaction.create({
        data: {
          signature,
          amount,
          wallet
        }
      });
    } catch (e) {
      return res.json({ success: false, error: "Already used" });
    }

    // 💰 update balance (atomique)
    const updatedUser = await prisma.user.update({
      where: { wallet },
      data: {
        balance: {
          increment: Number(amount.toFixed(6))
        }
      }
    });

    console.log("💰 Balance updated:", wallet, updatedUser.balance);

    return res.json({
      success: true,
      balance: updatedUser.balance
    });

  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;