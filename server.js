const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));


// Data file path
const dataFile = path.join(__dirname, 'data', 'runs.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  const initialData = {
    totalKm: 20,
    recentRuns: []
  };
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { totalKm: 20, recentRuns: [] };
  }
}

// Helper function to write data
function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Routes

// GET /api/runs - Get total km and recent runs
app.get('/api/runs', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch runs data' });
  }
});

// POST /api/runs - Add a new run
app.post('/api/runs', (req, res) => {
  try {
    const { firstName, lastName, location, distance } = req.body;
    
    // Validation
    if (!firstName || !lastName || !location || !distance) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      return res.status(400).json({ error: 'Invalid distance' });
    }
    
    // Read current data
    const data = readData();
    
    // Add new run
    const newRun = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      location: location.trim(),
      distance: distanceNum,
      timestamp: new Date().toISOString()
    };
    
    // Update data
    data.totalKm += distanceNum;
    data.recentRuns.unshift(newRun);
    
    // Keep only the last 10 runs
    data.recentRuns = data.recentRuns.slice(0, 10);
    
    // Write data
    if (writeData(data)) {
      res.json(data);
    } else {
      res.status(500).json({ error: 'Failed to save run' });
    }
  } catch (error) {
    console.error('Error adding run:', error);
    res.status(500).json({ error: 'Failed to add run' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dave\'s Running Club API is running' });
});

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Production mode: serving React app`);
  }
}); 