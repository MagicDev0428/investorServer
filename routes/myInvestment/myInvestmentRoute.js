import express from "express";
import { createInvestment } from "../../controllers/myInvestment/myInvestment";

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

