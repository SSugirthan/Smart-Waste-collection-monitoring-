const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    fillLevel: { type: Number, required: true, min: 0, max: 100 },
    status: { 
        type: String, 
        enum: ['Normal', 'Full', 'Maintenance', 'Critical'], 
        default: 'Normal' 
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Automatically update status based on fillLevel before saving if not explicit
binSchema.pre('save', function(next) {
    if (this.fillLevel >= 90) {
        this.status = 'Critical';
    } else if (this.fillLevel >= 75) {
        this.status = 'Full';
    } else if (this.status !== 'Maintenance') {
        this.status = 'Normal';
    }
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Bin', binSchema);
