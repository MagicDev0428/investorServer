const express = require("express");

import { createLog } from "../../controllers/log/createLog";
import { deleteLog } from "../../controllers/log/deleteLog";
import { getLog } from "../../controllers/log/getLog";
import { logList } from "../../controllers/log/logList";
import { updateLog } from "../../controllers/log/updateLog";

export const router = express.Router();

// Log Creation Route
router.post("/createlog", async (req, res) => {
  try {
    const result = await createLog(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// get log
router.get("/getlog/:logId", async (req, res) => {
  try {
    const result = await getLog(req.params.logId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// delete log
router.delete("/deletelog/:logId", async (req, res) => {
  try {
    const result = await deleteLog(req.params.logId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// updating Log
router.put("/updatelog", async (req, res) => {
  try {
    const result = await updateLog(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// getting log list
router.get("/loglist", async (req, res) => {
  try {
    const result = await logList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
