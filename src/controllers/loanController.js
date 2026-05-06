import { takeLoan } from "../services/loanService.js";

export const take = async (req, res) => {
  try {
    const { wallet, value } = req.body;

    const result = await takeLoan(wallet, value);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

import { swapLoan } from "../services/loanService.js";

export const swap = async (req, res) => {
  try {
    console.log("BODY =", req.body); // 👈 ajoute ça

    const { wallet, value } = req.body;

    const result = await swapLoan(wallet, value);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};