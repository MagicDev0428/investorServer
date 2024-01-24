import express from "express";
import { Lib, Middlewares } from "../../utils";
import { investmentNo } from "../../controllers/investment/investmentNo";
import {createInvestment} from"../../controllers/investment/createInvestment";
import {deleteInvestment}  from "../../controllers/investment/deleteInvestment";
import {getInvestment}  from "../../controllers/investment/getInvestment";
import {updateInvestment}  from "../../controllers/investment/updateInvestment";
import {investmentList}  from "../../controllers/investment/investmentList";
import {investmentInfo}  from "../../controllers/investment/investmentInfo";
import { allInvestments } from "../../controllers/investment/allInvestment";
import { getAllMyInvestmentsOfInvestment } from "../../controllers/investment/investmentMyInvestments";
import { totalAmountInvested } from "../../controllers/investment/totalAmountInvested";
import { MAX_FILES_PER_REQUEST } from "../../constants";
const router = express.Router();

// Investment Creation Route
router.post("/createinvestment",
Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "images",
  MAX_FILES_PER_REQUEST
), 
 async (req, res) => {
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
router.put("/updateinvestment",
Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "images",
  MAX_FILES_PER_REQUEST
), 
 async (req, res) => {
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


// get investment no

router.get("/allinvestments",async(req,res)=>{
  try {
    const result = await allInvestments();
    res.json(result);
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
})


router.get("/investmentMyInvestments/:investmentno",async(req,res)=>{
  try {
    const result = await getAllMyInvestmentsOfInvestment(req.params.investmentno);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/totalamountinvested/:investmentno",async(req,res)=>{
  try {
    const result = await totalAmountInvested(req.params.investmentno);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


module.exports = router;
