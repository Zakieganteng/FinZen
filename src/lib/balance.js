/**
 * Perhitungan saldo: saldo awal + pemasukan - pengeluaran
 */

export function getTransactionType(tx) {
  return tx?.type === "income" ? "income" : "expense";
}

export function isExpense(tx) {
  return getTransactionType(tx) === "expense";
}

export function isIncome(tx) {
  return getTransactionType(tx) === "income";
}

export function calculateBalance(initialBalance = 0, transactions = []) {
  const initial = parseFloat(initialBalance) || 0;
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    const amt = parseFloat(t.amount) || 0;
    if (isIncome(t)) income += amt;
    else expense += amt;
  }

  return initial + income - expense;
}

export function sumExpenses(transactions = [], filterFn = () => true) {
  return transactions
    .filter((t) => isExpense(t) && filterFn(t))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
}

export function sumIncome(transactions = [], filterFn = () => true) {
  return transactions
    .filter((t) => isIncome(t) && filterFn(t))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
}
