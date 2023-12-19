import express from "express";
import { createInvestment } from "../../controllers/myInvestment/myInvestment";
import { myInvestmentList } from "../../controllers/myInvestment/myInvestmentList";
import { deleteMyInvestment } from "../../controllers/myInvestment/deleteMyInvestment";

export const router = express.Router();

// Investor Creation Route
router.post("/createmyinvestment", async (req, res) => {
  try {
    const result = await createInvestment(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete myInvestment
router.delete("/deletemyinvestment/:myInvestmentId", async (req, res) => {
  try {
    const result = await deleteMyInvestment(req.params.myInvestmentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting investment list
router.get("/myinvestmentlist", async (req, res) => {
  try {
    const result = await myInvestmentList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});