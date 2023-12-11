const express = require("express");
const {
  adamCreate,
  adamDelete,
  adamGet,
  adamList,
  adamUpdate,
  adamInvestors,
} = require("../../controllers/adam/adam");

const router = express.Router();

// create adam
router.post("/createadam", async (req, res) => {
  try {
    const result = await adamCreate(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get adam by id
router.get("/getadam/:adamId", async (req, res) => {
  try {
    const result = await adamGet(req.params.adamId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete adam
router.delete("/deleteadam/:adamId", async (req, res) => {
  try {
    const result = await adamDelete(req.params.adamId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update adam
router.put("/updateadam", async (req, res) => {
  try {
    const result = await adamUpdate(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// list of adam

router.get("/listadam", async (req, res) => {
  try {
    const result = await adamList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/adaminvestors", async (req, res) => {
  try {
    const result = await adamInvestors();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
