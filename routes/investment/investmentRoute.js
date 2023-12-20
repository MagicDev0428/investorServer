const express = require("express");

import { investmentNo } from "../../controllers/investment/investmentNo";
import {createInvestment} from"../../controllers/investment/createInvestment";
import {deleteInvestment}  from "../../controllers/investment/deleteInvestment";
import {getInvestment}  from "../../controllers/investment/getInvestment";
import {updateInvestment}  from "../../controllers/investment/updateInvestment";
import {investmentList}  from "../../controllers/investment/investmentList";
import {investmentInfo}  from "../../controllers/investment/investmentInfo";

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


// get investment no

router.get("/investmentno",async(req,res)=>{
  try {
    const result = await investmentNo();
    res.json(result);
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
})

module.exports = router;
