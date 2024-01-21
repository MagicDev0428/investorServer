import express from "express";
import { createInvestment } from "../../controllers/myInvestment/createMyInvestment";
import { myInvestmentList } from "../../controllers/myInvestment/myInvestmentList";
import { deleteMyInvestment } from "../../controllers/myInvestment/deleteMyInvestment";
import { getMyInvestment } from "../../controllers/myInvestment/getMyInvestment";
import { updateMyInvestment } from "../../controllers/myInvestment/updateMyInvestment";
import { Middlewares } from "../../utils";
import { MAX_FILES_PER_REQUEST } from "../../constants";


export const router = express.Router();

// my investment Creation Route
router.post("/createmyinvestment",
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

// delete myInvestment
router.delete("/deletemyinvestment/:myInvestmentId", async (req, res) => {
  try {
    const result = await deleteMyInvestment(req.params.myInvestmentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting my investment list
router.get("/myinvestmentlist", async (req, res) => {
  try {
    const result = await myInvestmentList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// getting my investment 
router.get("/getmyinvestment/:myinvestmentId", async (req, res) => {
  try {
    const result = await getMyInvestment(req.params.myinvestmentId);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

// update my investment 
router.put("/updatemyinvestment",
Middlewares.checkAdminPrivileges,
Middlewares.StorageMiddlewares.upload.array(
  "images",
  MAX_FILES_PER_REQUEST
), 
async (req, res) => {
  try {
    const result = await updateMyInvestment(req);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});