require('dotenv').config();
const mongoose = require('mongoose');
const Bin = require('./models/Bin');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
      console.error('Connection error:', err);
      process.exit(1);
  });

const seedBins = [
    { locationName: 'Downtown Park Plaza', latitude: 40.7128, longitude: -74.0060, fillLevel: 45 },
    { locationName: 'City Square East', latitude: 40.7142, longitude: -74.0064, fillLevel: 92 },
    { locationName: 'Main Street Mall', latitude: 40.7155, longitude: -74.0040, fillLevel: 10 },
    { locationName: 'University Campus Gate', latitude: 40.7160, longitude: -74.0080, fillLevel: 78 },
    { locationName: 'Train Station Entrance', latitude: 40.7180, longitude: -74.0010, fillLevel: 98 },
    { locationName: 'Central Library', latitude: 40.7130, longitude: -74.0020, fillLevel: 25 },
];

const seedDB = async () => {
    try {
        await Bin.deleteMany({});
        console.log('Cleared existing bins');
        for (const item of seedBins) {
            const b = new Bin(item);
            await b.save();
        }
        console.log('Database seeded successfully with ' + seedBins.length + ' bins!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        process.exit();
    }
};

seedDB();
