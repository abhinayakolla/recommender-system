const express = require("express");
const Item = require("../models/Item");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET all items (with pagination + search)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };
    const items = await Item.find(filter).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
    const count = await Item.countDocuments(filter);
    res.json({ items, total: count, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE item (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE item (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE item (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
