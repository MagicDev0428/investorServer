import express from "express";

import { createBalance } from "../../controllers/balance/createBalance";
import { getBalance } from "../../controllers/balance/getBalance";
import { deleteBalance } from "../../controllers/balance/deleteBalance";
import { updateBalance } from "../../controllers/balance/updateBalance";
import { balanceList } from "../../controllers/balance/balanceList";
import { investorBalanceList } from "../../controllers/balance/investorBalanceList";
import { investorBalanceListWithNewInvestment } from "../../controllers/balance/investorBalanceWithNewMyInvestment";
import { sendBalanceEmail } from "../../controllers/balance/balanceEmail";
import { investorMonthlyDeposit } from "../../controllers/myInvestment/investorMonthlyDeposit";
import { MAX_FILES_PER_REQUEST } from "../../constants";
import { Middlewares } from "../../utils";
export const router = express.Router();


// BalanceCreation Route
router.post("/createbalance",
Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "images",
  MAX_FILES_PER_REQUEST
), 
async (req, res) => {
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
router.put("/updatebalance",
Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "images",
  MAX_FILES_PER_REQUEST
), 
async (req, res) => {
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


// get balance
router.get("/investorbalancelist/:investorId", async (req, res) => {
  try {
    const result = await investorBalanceList(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get balance list with new investment
router.get("/balancewithmyinvestment/:investorId", async (req, res) => {
  try {
    const result = await investorBalanceListWithNewInvestment(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Send email for balance
// Route: sendEmail
router.post("/sendEmail", async (req, res) => {
  try {
    const result = await sendBalanceEmail(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// get investor deposit for current month
router.get("/investorMonthlyDeposit/:investorId", async (req, res) => {
  try {
    const result = await investorMonthlyDeposit(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

