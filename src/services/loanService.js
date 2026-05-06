import prisma from "../config/prisma.js";

export const takeLoan = async (wallet, value) => {
  const user = await prisma.user.findUnique({
    where: { wallet },
    include: { loans: true }
  });

  if (!user) throw new Error("User not found");

  const used = user.loans.reduce((sum, l) => sum + l.value, 0);
  const limit = user.balance * 0.8;

  if (used + value > limit) {
    throw new Error("Not enough collateral");
  }

  const loan = await prisma.activeLoan.create({
    data: {
      userId: user.id,
      value
    }
  });

  return {
    loan,
    used: used + value,
    limit
  };
};

export const swapLoan = async (wallet, newValue) => {
  const user = await prisma.user.findUnique({
    where: { wallet },
    include: { loans: true }
  });

  if (!user) throw new Error("User not found");

  const currentTotal = user.loans.reduce((sum, l) => sum + l.value, 0);
  const limit = user.balance * 0.8;

  // 👉 on supprime tout
  await prisma.activeLoan.deleteMany({
    where: { userId: user.id }
  });

  // 👉 vérifie nouveau
  if (newValue > limit) {
    throw new Error("Not enough collateral");
  }

  // 👉 crée nouveau loan
  const loan = await prisma.activeLoan.create({
    data: {
      userId: user.id,
      value: newValue
    }
  });

  return {
    loan,
    used: newValue,
    limit
  };
};