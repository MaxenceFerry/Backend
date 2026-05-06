require("dotenv").config();
const express = require("express");
const cors = require("cors");
const solanaWeb3 = require("@solana/web3.js");

const app = express();

// ✅ CORS propre
app.use(cors({
  origin: [
    "http://localhost:5000",
    "http://localhost:55219",
    "https://nargarskins.com",
    "https://www.nargarskins.com"
  ]
}));

app.use(express.json());

// ==============================
// 🔐 CONFIG
// ==============================

const RECEIVER_WALLET = new solanaWeb3.PublicKey(
  "B5dcB68cG6CBtpL4FxMHo9j3wLbkfwhDYfbcUetzVqNt"
);

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const RECEIVER = "9MUkxmVgtRp25UT9SkfqughWDcckV9VMNVEN8w4PphrJ";

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

// ✅ ENV sécurisé
if (!process.env.HELIUS_RPC) {
  throw new Error("Missing HELIUS_RPC env variable");
}

const connection = new solanaWeb3.Connection(
  process.env.HELIUS_RPC,
  "confirmed"
);

// ⚠️ Vérifie ce chemin !
const depositRoute = require("../deposit/confirm.cjs");
app.use("/deposit", depositRoute);

// ==============================
// 📡 ROUTES
// ==============================

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/balance/:wallet", async (req, res) => {
  try {

    const wallet = req.params.wallet;

    const user = await prisma.user.findUnique({
      where: { wallet }
    });

    res.json({
      balance: user?.balance || 0
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

// ==============================
// 🚀 START SERVER (OBLIGATOIRE)
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});