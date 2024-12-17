const express = require("express");
const {
  resetAccounts,
  getBalance,
  deposit,
  withdraw,
} = require("./accountService");

const router = express.Router();

router.post("/reset", async (req, res) => {
  await resetAccounts();
  res.json({ status: "ok" });
});

router.get("/balance/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const balance = await getBalance(userId);
  res.json({ balance });
});

router.post("/deposit", async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const newBalance = await deposit(userId, amount);
    res.json({ newBalance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/withdraw", async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const newBalance = await withdraw(userId, amount);
    res.json({ newBalance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
