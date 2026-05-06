export function calculateBorrowLimit(balance) {
  return Math.floor(balance * 0.8);
}