const { Connection } = require("@solana/web3.js");

const connection = new Connection("https://api.mainnet-beta.solana.com");

// ⚠️ mets ton wallet ici ou via .env
const ESCROW_WALLET = process.env.ESCROW_WALLET;

async function verifyDeposit(signature, expectedWallet) {
  const tx = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0
  });

  if (!tx) return null;

  const instructions = tx.transaction.message.instructions;

  for (let ix of instructions) {
    if (ix.program === "spl-token") {
      const info = ix.parsed.info;

      if (
        info.destination === ESCROW_WALLET &&
        info.authority === expectedWallet &&
        info.tokenAmount.uiAmount > 0
      ) {
        return {
          amount: info.tokenAmount.uiAmount,
          mint: info.mint
        };
      }
    }
  }

  return null;
}

module.exports = { verifyDeposit };