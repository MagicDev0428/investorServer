const express = require("express");

const {createInvestment} =  require("../../controllers/investment/createInvestment");
const {deleteInvestment} = require("../../controllers/investment/deleteInvestment");
const {getInvestment} = require("../../controllers/investment/getInvestment");
const {updateInvestment} = require("../../controllers/investment/updateInvestment");
const {investmentList} = require("../../controllers/investment/investmentList");
const {investmentInfo} = require("../../controllers/investment/investmentInfo");

const router = express.Router();

// Investment Creation Route
router.post("/createinvestment", async (req, res) => {
  try {
    const result = await createInvestment(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get investment
router.get("/getinvestment/:investmentId", async (req, res) => {
  try {
    const result = await getInvestment(req.params.investmentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete investment
router.delete("/deleteinvestment/:investmentId", async (req, res) => {
  try {
    const result = await deleteInvestment(req.params.investmentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// updating Investment
router.put("/updateinvestment", async (req, res) => {
  try {
    const result = await updateInvestment(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting investment list
router.get("/investmentlist", async (req, res) => {
  try {
    const result = await investmentList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting investment info
router.get("/investmentinfo/:investmentId", async (req, res) => {
  try {
    const result = await investmentInfo(req.params.investmentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
