const pool = require("./db");

async function resetAccounts() {
  await pool.query(`DROP TABLE IF EXISTS accounts;`);
  await pool.query(`
    CREATE TABLE accounts (
      id SERIAL PRIMARY KEY,
      balance INT NOT NULL DEFAULT 0
    );
  `);
  await pool.query(
    `INSERT INTO accounts(balance) VALUES (1000), (1000), (1000);`
  );
  return true;
}

async function getBalance(userId) {
  const { rows } = await pool.query(
    "SELECT balance FROM accounts WHERE id = $1;",
    [userId]
  );
  return rows[0].balance;
}

async function deposit(userId, amount) {
  const { rows } = await pool.query(
    "SELECT balance FROM accounts WHERE id = $1;",
    [userId]
  );
  // Introduce a delay to increase the chance of another request interfering
  await new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * 50))
  );

  const newBalance = rows[0].balance + amount;
  await pool.query("UPDATE accounts SET balance = $1 WHERE id = $2;", [
    newBalance,
    userId,
  ]);
  return newBalance;
}

async function withdraw(userId, amount) {
  const { rows } = await pool.query(
    "SELECT balance FROM accounts WHERE id = $1;",
    [userId]
  );
  // Same random delay
  await new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * 50))
  );

  const currentBalance = rows[0].balance;
  if (currentBalance < amount) {
    throw new Error("Insufficient funds");
  }
  const newBalance = currentBalance - amount;
  await pool.query("UPDATE accounts SET balance = $1 WHERE id = $2;", [
    newBalance,
    userId,
  ]);
  return newBalance;
}


module.exports = { resetAccounts, getBalance, deposit, withdraw };
