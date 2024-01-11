const express = require("express");
const { investorGet,getInvestorNickName} = require("../../controllers/investor/getInvestor");
const { updateInvestor } = require("../../controllers/investor/updateInvestor");
const { deleteInvestor } = require("../../controllers/investor/deleteInvestor");
const { investorCreate } = require("../../controllers/investor/createInvestor");
import {  Middlewares } from "../../utils";
import { MAX_FILES_PER_REQUEST } from "../../constants";
import { investorInfoForDate,investorListForDate } from "../../controllers/investor/investorList";
const {
  investorInfo,
  investorList,
} = require("../../controllers/investor/investorsListInfo");
import { investorInfoById } from "../../controllers/investor/investorInfoById";
import { getHiddenRemarks, saveHiddenRemarks } from "../../controllers/investor/investorHiddenRemark";
import { getCopyPaste, saveCopyPaste } from "../../controllers/investor/investorCopyPaste";
import { investorPortfolio } from "../../controllers/portfolio/portfolio";
import { lastLoginDate } from "../../controllers/investorPinandLogin/investorPinandLogin";

const router = express.Router();

// Investor Creation Route
router.post("/createinvestor", 

Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "passportImages",
  MAX_FILES_PER_REQUEST
), 
async (req, res) => {
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
router.put("/updateinvestor",
Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "passportImages",
  MAX_FILES_PER_REQUEST
), async (req, res) => {
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


// getting investor information by date
router.post("/investorinfobydate", async (req, res) => {
  try {
    const result = await investorInfoForDate(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/investorlistbydate", async (req, res) => {
  try {
    const result = await investorListForDate(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting investor info by id
router.get("/investorinfobyid/:investorId", async (req, res) => {
  try {
    const result = await investorInfoById(req.params.investorId);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

// getting investor hidden remarks by id
router.get("/investorhiddenremarks/:investorId", async (req, res) => {
  try {
    const result = await getHiddenRemarks(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// save investor hidden remarks by id
router.post("/investorhiddenremarks", async (req, res) => {
  try {
    const result = await saveHiddenRemarks(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// getting investor copy paster by id
router.get("/investorcopypaste/:investorId", async (req, res) => {
  try {
    const result = await getCopyPaste(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// save investor copy paster by id
router.post("/investorcopypaste", async (req, res) => {
  try {
    const result = await saveCopyPaste(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting investor hidden remarks by id
router.get("/investorportfolio/:investorId", async (req, res) => {
  try {
    const result = await investorPortfolio(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// get investor nick name
router.get("/getinvestornickname/:investorId", async (req, res) => {
  try {
    const result = await getInvestorNickName(req.params.investorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put("/updateLastLogin/:investorId",async(req,res)=>{
  try {
    const result = await lastLoginDate(req.params.investorId);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
})

module.exports = router;
