const express = require("express");
const { investorGet } = require("../../controllers/investor/getInvestor");
const { updateInvestor } = require("../../controllers/investor/updateInvestor");
const { deleteInvestor } = require("../../controllers/investor/deleteInvestor");
const { investorCreate } = require("../../controllers/investor/createInvestor");
const {
  investorInfo,
  investorList,
} = require("../../controllers/investor/investorsListInfo");

const router = express.Router();

// Investor Creation Route
router.post("/createinvestor", async (req, res) => {
  try {
    const result = await investorCreate(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get investor
router.get("/getinvestor/:investorId", async (req, res) => {
  try {
    const result = await investorGet(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete investor
router.delete("/deleteinvestor/:investorId", async (req, res) => {
  try {
    const result = await deleteInvestor(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// updating investor
router.put("/updateinvestor", async (req, res) => {
  try {
    const result = await updateInvestor(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// getting investor list
router.get("/investorlist", async (req, res) => {
  try {
    const result = await investorList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// getting investor info
router.get("/investorinfo/:investorId", async (req, res) => {
  try {
    const result = await investorInfo(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
