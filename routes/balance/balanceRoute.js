import express from "express";

import { createBalance } from "../../controllers/balance/createBalance";
import { getBalance } from "../../controllers/balance/getBalance";
import { deleteBalance } from "../../controllers/balance/deleteBalance";
import { updateBalance } from "../../controllers/balance/updateBalance";
import { balanceList } from "../../controllers/balance/balanceList";

export const router = express.Router();


// BalanceCreation Route
router.post("/createbalance", async (req, res) => {
  try {
    const result = await createBalance(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// get balance
router.get("/getbalance/:balanceId", async (req, res) => {
  try {
    const result = await getBalance(req.params.balanceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// delete balance
router.delete("/deletebalance/:balanceId", async (req, res) => {
  try {
    const result = await deleteBalance(req.params.balanceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// updating balance
router.put("/updatebalance", async (req, res) => {
  try {
    const result = await updateBalance(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting Balance list
router.get("/balancelist", async (req, res) => {
  try {
    const result = await balanceList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

