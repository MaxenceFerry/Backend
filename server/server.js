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

// ==============================
// 🧠 TEMP STORAGE (MVP)
// ==============================

const balances = {};
const usedSignatures = new Set();

global.balances = balances;
global.usedSignatures = usedSignatures;

// ⚠️ Vérifie ce chemin !
const depositRoute = require("../deposit/confirm.cjs");
app.use("/deposit", depositRoute);

// ==============================
// 📡 ROUTES
// ==============================

app.get("/balance/:wallet", (req, res) => {
  const wallet = req.params.wallet;

  res.json({
    balance: balances[wallet] || 0
  });
});

// ==============================
// 🚀 START SERVER (OBLIGATOIRE)
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});