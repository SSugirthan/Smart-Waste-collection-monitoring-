const express = require('express');
const Bin = require('../models/Bin');
const router = express.Router();

// Get all bins
router.get('/', async (req, res) => {
    try {
        const bins = await Bin.find().sort({ lastUpdated: -1 });
        res.json(bins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific bin
router.get('/:id', async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) return res.status(404).json({ message: 'Bin not found' });
        res.json(bin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new bin
router.post('/', async (req, res) => {
    const bin = new Bin(req.body);
    try {
        const newBin = await bin.save();
        res.status(201).json(newBin);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Partial update of a bin (e.g. updating fillLevel)
router.patch('/:id', async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) return res.status(404).json({ message: 'Bin not found' });
        
        if (req.body.fillLevel !== undefined) {
            bin.fillLevel = req.body.fillLevel;
        }
        if (req.body.status !== undefined) {
            bin.status = req.body.status;
        }
        if (req.body.locationName !== undefined) {
            bin.locationName = req.body.locationName;
        }
        
        const updatedBin = await bin.save();
        res.json(updatedBin);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a bin
router.delete('/:id', async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) return res.status(404).json({ message: 'Bin not found' });
        await bin.deleteOne();
        res.json({ message: 'Bin deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
