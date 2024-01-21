import express from "express";
import { calculateWithdrawalAmounts } from "../../controllers/frontpage/moneyForEnvelop";

export const router = express.Router();


// get investment
router.get("/moneyforenvelop/:amount", async (req, res) => {
  try {
    const result =  await calculateWithdrawalAmounts(req.params.amount);
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});