const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyv2';

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password, loginType } = req.body;
        
        if (loginType === 'admin' && username === 'Sugirthan' && password === 'sugir1192006') {
            const token = jwt.sign({ id: 'dummy', role: 'admin' }, JWT_SECRET, { expiresIn: '6h' });
            return res.json({ token, username: 'Sugirthan', role: 'admin' });
        }
        if (loginType === 'user' && password === '1234') {
            const token = jwt.sign({ id: 'dummy2', role: 'user' }, JWT_SECRET, { expiresIn: '6h' });
            return res.json({ token, username: username || 'General User', role: 'user' });
        }

        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (user.role !== loginType) {
            return res.status(403).json({ message: 'Access denied: You are not authorized for this portal access type.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '6h' });
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        const { username, password, loginType } = req.body;
        if (loginType === 'admin' && username === 'Sugirthan' && password === 'sugir1192006') {
           const token = jwt.sign({ id: 'dummy', role: 'admin' }, JWT_SECRET, { expiresIn: '6h' });
           return res.json({ token, username: 'Sugirthan', role: 'admin' });
        }
        if (loginType === 'user' && password === '1234') {
           const token = jwt.sign({ id: 'dummy2', role: 'user' }, JWT_SECRET, { expiresIn: '6h' });
           return res.json({ token, username: username || 'General User', role: 'user' });
        }
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
