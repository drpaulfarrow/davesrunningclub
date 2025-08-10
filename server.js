// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
console.log('SendGrid API Key configured:', SENDGRID_API_KEY ? 'Yes' : 'No');
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('📧 SendGrid configured successfully');
} else {
  console.log('⚠️  SendGrid not configured - emails will not be sent');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to read users data
function readUsersData() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users data:', error);
    return { users: {} };
  }
}

// Helper function to write users data
function writeUsersData(data) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users data:', error);
    return false;
  }
}

// Helper function to hash passwords (simple implementation)
function hashPassword(password) {
  // In a real app, you'd use bcrypt or similar
  return Buffer.from(password).toString('base64');
}

// Helper function to verify passwords
function verifyPassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

// Helper function to generate verification token
function generateVerificationToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to send verification email
async function sendVerificationEmail(email, firstName, verificationToken) {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid not configured. Verification email would be sent to:', email);
    console.log('Verification token:', verificationToken);
    return true;
  }

  const verificationUrl = `${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  const msg = {
    to: email,
    from: 'paulandrewfarrow@gmail.com', // Using your verified email
    subject: 'Verify your email - Dave\'s Running Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Dave's Running Club!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering with Dave's Running Club. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with Dave's Running Club, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Dave's Running Club - Honouring Dave Reynolds' memory</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// User authentication middleware
const authenticateUser = (req, res, next) => {
  const { userId, password } = req.body;
  
  if (!userId || !password) {
    return res.status(401).json({ error: 'User ID and password required' });
  }
  
  const usersData = readUsersData();
  const user = usersData.users[userId];
  
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  req.user = user;
  req.userId = userId;
  next();
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const { adminPassword } = req.body;
  if (adminPassword === process.env.ADMIN_PASSWORD || adminPassword === 'dave2025') {
    next();
  } else {
    res.status(401).json({ error: 'Invalid admin password' });
  }
};

// Data file paths
const dataFile = path.join(__dirname, 'data', 'runs.json');
const usersFile = path.join(__dirname, 'data', 'users.json');
const photosFile = path.join(__dirname, 'data', 'photos.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(dataFile)) {
  const initialData = {
    totalKm: 20,
    recentRuns: [],
    personalRuns: {}
  };
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

if (!fs.existsSync(usersFile)) {
  const initialUsers = {
    users: {}
  };
  fs.writeFileSync(usersFile, JSON.stringify(initialUsers, null, 2));
}

if (!fs.existsSync(photosFile)) {
  const initialPhotos = {
    photos: []
  };
  fs.writeFileSync(photosFile, JSON.stringify(initialPhotos, null, 2));
}

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { totalKm: 20, recentRuns: [], personalRuns: {} };
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

// Helper function to read photos data
function readPhotosData() {
  try {
    const data = fs.readFileSync(photosFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading photos data:', error);
    return { photos: [] };
  }
}

// Helper function to write photos data
function writePhotosData(data) {
  try {
    fs.writeFileSync(photosFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing photos data:', error);
    return false;
  }
}

// Helper function to generate user ID
function generateUserId(firstName, lastName) {
  return `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}`;
}

// Helper function to get user stats
function getUserStats(userId, runsData) {
  // Ensure personalRuns exists
  if (!runsData.personalRuns) {
    runsData.personalRuns = {};
  }
  
  const userRuns = runsData.personalRuns[userId] || [];
  const totalDistance = userRuns.reduce((sum, run) => sum + parseFloat(run.distance), 0);
  const totalRuns = userRuns.length;
  const averageDistance = totalRuns > 0 ? (totalDistance / totalRuns).toFixed(1) : 0;
  
  return {
    totalDistance: totalDistance.toFixed(1),
    totalRuns,
    averageDistance,
    recentRuns: userRuns.slice(-5).reverse() // Last 5 runs
  };
}

// Routes

// POST /api/auth/register - Register a new user
app.post('/api/auth/register', (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const usersData = readUsersData();
    const userId = generateUserId(firstName, lastName);
    
    // Check if user already exists
    if (usersData.users[userId]) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Check if email already exists
    const existingUser = Object.values(usersData.users).find(u => u.email === email.trim().toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Create new user
    const newUser = {
      id: userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: hashPassword(password),
      verificationToken: verificationToken,
      tokenExpiry: tokenExpiry.toISOString(),
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    
    usersData.users[userId] = newUser;
    
    if (writeUsersData(usersData)) {
      console.log('✅ User registered successfully:', userId);
      console.log('📧 Sending verification email to:', email.trim().toLowerCase());
      // Send verification email
      sendVerificationEmail(email.trim().toLowerCase(), firstName.trim(), verificationToken);
      
      res.json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        userId: userId,
        user: {
          id: userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          isVerified: false
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const usersData = readUsersData();
    const user = Object.values(usersData.users).find(u => u.email === email.trim().toLowerCase());
    
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        error: 'Please verify your email address before logging in. Check your inbox for a verification link.',
        needsVerification: true 
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/auth/verify-email - Verify email with token
app.get('/api/auth/verify-email', (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    const usersData = readUsersData();
    const user = Object.values(usersData.users).find(u => u.verificationToken === token);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    // Check if token has expired
    if (new Date() > new Date(user.tokenExpiry)) {
      return res.status(400).json({ error: 'Verification token has expired. Please register again.' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    delete user.verificationToken;
    delete user.tokenExpiry;
    
    if (writeUsersData(usersData)) {
      res.json({
        success: true,
        message: 'Email verified successfully! You can now log in.',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: true
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to verify email' });
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// POST /api/auth/resend-verification - Resend verification email
app.post('/api/auth/resend-verification', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const usersData = readUsersData();
    const user = Object.values(usersData.users).find(u => u.email === email.trim().toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    user.verificationToken = verificationToken;
    user.tokenExpiry = tokenExpiry.toISOString();
    
    if (writeUsersData(usersData)) {
      // Send verification email
      sendVerificationEmail(email.trim().toLowerCase(), user.firstName, verificationToken);
      
      res.json({
        success: true,
        message: 'Verification email sent successfully!'
      });
    } else {
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// GET /api/auth/user/:userId - Get user profile
app.get('/api/auth/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const usersData = readUsersData();
    const user = usersData.users[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// GET /api/runs - Get total km and recent runs
app.get('/api/runs', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch runs data' });
  }
});

// POST /api/runs - Add a new run (requires authentication)
app.post('/api/runs', authenticateUser, (req, res) => {
  try {
    const { location, distance } = req.body;
    const { userId } = req;
    const { firstName, lastName } = req.user;
    
    // Validation
    if (!location || !distance) {
      return res.status(400).json({ error: 'Location and distance are required' });
    }
    
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      return res.status(400).json({ error: 'Invalid distance' });
    }
    
    // Read current data
    const data = readData();
    
    // Ensure personalRuns exists
    if (!data.personalRuns) {
      data.personalRuns = {};
    }
    
    // Add new run
    const newRun = {
      id: Date.now().toString(),
      firstName: firstName,
      lastName: lastName,
      location: location.trim(),
      distance: distanceNum,
      timestamp: new Date().toISOString(),
      userId: userId
    };
    
    // Update data
    data.totalKm += distanceNum;
    data.recentRuns.unshift(newRun);
    
    // Keep only the last 20 recent runs
    data.recentRuns = data.recentRuns.slice(0, 20);
    
    // Add to personal runs
    if (!data.personalRuns[userId]) {
      data.personalRuns[userId] = [];
    }
    data.personalRuns[userId].push(newRun);
    
    // Write data
    if (writeData(data)) {
      res.json({
        success: true,
        totalKm: data.totalKm.toFixed(1),
        recentRuns: data.recentRuns.slice(0, 10),
        userStats: getUserStats(userId, data),
        userId: userId
      });
    } else {
      res.status(500).json({ error: 'Failed to save run' });
    }
  } catch (error) {
    console.error('Error adding run:', error);
    res.status(500).json({ error: 'Failed to add run' });
  }
});

// GET /api/user/:userId - Get user stats
app.get('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = readData();
    
    const userStats = getUserStats(userId, data);
    res.json(userStats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// GET /api/leaderboard - Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const data = readData();
    
    // Ensure personalRuns exists
    if (!data.personalRuns) {
      data.personalRuns = {};
    }
    
    const leaderboard = Object.entries(data.personalRuns).map(([userId, runs]) => {
      const totalDistance = runs.reduce((sum, run) => sum + parseFloat(run.distance), 0);
      const latestRun = runs[runs.length - 1];
      return {
        userId,
        firstName: latestRun.firstName,
        lastName: latestRun.lastName,
        totalDistance: totalDistance.toFixed(1),
        totalRuns: runs.length,
        lastRun: latestRun.timestamp
      };
    }).sort((a, b) => parseFloat(b.totalDistance) - parseFloat(a.totalDistance));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// GET /api/photos - Get all photos
app.get('/api/photos', (req, res) => {
  try {
    console.log('Fetching photos...');
    const photosData = readPhotosData();
    console.log('Photos data:', photosData);
    const photos = photosData.photos || [];
    console.log('Photos array:', photos);
    const approvedPhotos = photos.filter(photo => photo.status === 'approved');
    console.log('Approved photos:', approvedPhotos);
    res.json(approvedPhotos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Helper function to send photo notification email
async function sendPhotoNotification(photo) {
  try {
    if (!SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping photo notification email');
      return;
    }

    const msg = {
      to: 'paulandrewfarrow@gmail.com',
      from: 'paulandrewfarrow@gmail.com',
      subject: 'New Photo Submitted - Dave\'s Running Club',
      text: `
A new photo has been submitted to Dave's Running Club website.

Photo Details:
- Submitted by: ${photo.firstName} ${photo.lastName}
- Caption: ${photo.caption || 'No caption provided'}
- Submitted at: ${new Date(photo.timestamp).toLocaleString('en-GB')}
- Photo ID: ${photo.id}

The photo is now pending approval in the admin panel.
You can review and approve/reject it at: http://localhost:3000/admin

Best regards,
Dave's Running Club Website
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">📸 New Photo Submitted</h2>
          <p>A new photo has been submitted to <strong>Dave's Running Club</strong> website.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Photo Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Submitted by:</strong> ${photo.firstName} ${photo.lastName}</li>
              <li><strong>Caption:</strong> ${photo.caption || 'No caption provided'}</li>
              <li><strong>Submitted at:</strong> ${new Date(photo.timestamp).toLocaleString('en-GB')}</li>
              <li><strong>Photo ID:</strong> ${photo.id}</li>
            </ul>
          </div>
          
          <p>The photo is now <strong>pending approval</strong> in the admin panel.</p>
          
          <div style="background: #667eea; color: white; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <a href="http://localhost:3000/admin" style="color: white; text-decoration: none; font-weight: bold;">
              🔍 Review Photo in Admin Panel
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Dave's Running Club Website
          </p>
        </div>
      `
    };

    console.log('📧 Sending photo notification email...');
    console.log('📧 To: paulandrewfarrow@gmail.com');
    console.log('📧 Subject: New Photo Submitted - Dave\'s Running Club');
    console.log('📧 Photo Details:', {
      submitter: `${photo.firstName} ${photo.lastName}`,
      caption: photo.caption || 'No caption',
      timestamp: photo.timestamp,
      id: photo.id
    });
    
    if (SENDGRID_API_KEY) {
      await sgMail.send(msg);
      console.log('✅ Photo notification email sent successfully via SendGrid');
    } else {
      console.log('⚠️ SendGrid not configured - email would be sent to paulandrewfarrow@gmail.com');
      console.log('📧 To set up SendGrid, follow the instructions in sendgrid-setup.md');
    }
  } catch (error) {
    console.error('❌ Error sending photo notification email:', error);
    // Don't throw error - we don't want photo upload to fail if email fails
  }
}

// Helper function to send photo action notification email
async function sendPhotoActionNotification(photo, action) {
  try {
    if (!SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping photo action notification email');
      return;
    }

    const actionText = action === 'approved' ? 'approved' : 'rejected';
    const actionEmoji = action === 'approved' ? '✅' : '❌';
    const actionColor = action === 'approved' ? '#10b981' : '#ef4444';

    const msg = {
      to: 'paulandrewfarrow@gmail.com',
      from: 'paulandrewfarrow@gmail.com',
      subject: `Photo ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} - Dave's Running Club`,
      text: `
A photo has been ${actionText} in Dave's Running Club website.

Photo Details:
- Submitted by: ${photo.firstName} ${photo.lastName}
- Caption: ${photo.caption || 'No caption provided'}
- Submitted at: ${new Date(photo.timestamp).toLocaleString('en-GB')}
- Photo ID: ${photo.id}
- Action: ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}

Best regards,
Dave's Running Club Website
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${actionEmoji} Photo ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h2>
          <p>A photo has been <strong>${actionText}</strong> in Dave's Running Club website.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Photo Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Submitted by:</strong> ${photo.firstName} ${photo.lastName}</li>
              <li><strong>Caption:</strong> ${photo.caption || 'No caption provided'}</li>
              <li><strong>Submitted at:</strong> ${new Date(photo.timestamp).toLocaleString('en-GB')}</li>
              <li><strong>Photo ID:</strong> ${photo.id}</li>
              <li><strong>Action:</strong> <span style="color: ${actionColor}; font-weight: bold;">${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</span></li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Dave's Running Club Website
          </p>
        </div>
      `
    };

    console.log(`📧 Sending photo ${action} notification email...`);
    console.log(`📧 To: paulandrewfarrow@gmail.com`);
    console.log(`📧 Subject: Photo ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} - Dave's Running Club`);
    console.log(`📧 Photo Details:`, {
      submitter: `${photo.firstName} ${photo.lastName}`,
      caption: photo.caption || 'No caption',
      timestamp: photo.timestamp,
      id: photo.id,
      action: actionText.charAt(0).toUpperCase() + actionText.slice(1)
    });
    
    if (SENDGRID_API_KEY) {
      await sgMail.send(msg);
      console.log(`✅ Photo ${action} notification email sent successfully via SendGrid`);
    } else {
      console.log(`⚠️ SendGrid not configured - ${action} notification would be sent to paulandrewfarrow@gmail.com`);
      console.log('📧 To set up SendGrid, follow the instructions in sendgrid-setup.md');
    }
  } catch (error) {
    console.error(`❌ Error sending photo ${action} notification email:`, error);
    // Don't throw error - we don't want admin action to fail if email fails
  }
}

// POST /api/photos - Upload a new photo
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, caption, userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const photosData = readPhotosData();
    
    const newPhoto = {
      id: Date.now().toString(),
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      caption: caption ? caption.trim() : '',
      userId: userId || generateUserId(firstName, lastName),
      timestamp: new Date().toISOString(),
      status: 'pending' // New photos are pending approval
    };
    
    photosData.photos.unshift(newPhoto);
    
    // Keep only the last 50 photos
    if (photosData.photos.length > 50) {
      photosData.photos = photosData.photos.slice(0, 50);
    }
    
    if (writePhotosData(photosData)) {
      // Send email notification (don't wait for it to complete)
      sendPhotoNotification(newPhoto).catch(error => {
        console.error('Failed to send photo notification:', error);
      });
      
      res.json({
        success: true,
        photo: newPhoto
      });
    } else {
      res.status(500).json({ error: 'Failed to save photo' });
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// DELETE /api/photos/:id - Delete a photo
app.delete('/api/photos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const photosData = readPhotosData();
    
    const photoIndex = photosData.photos.findIndex(photo => photo.id === id);
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = photosData.photos[photoIndex];
    
    // Delete the file
    const filePath = path.join(__dirname, 'uploads', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from data
    photosData.photos.splice(photoIndex, 1);
    
    if (writePhotosData(photosData)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// POST /api/contact - Send email via SendGrid
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }
    
    // Create email message
    const msg = {
      to: 'paulandrewfarrow@gmail.com',
      from: 'paulandrewfarrow@gmail.com', // Using your verified Gmail
      subject: 'Message from Dave\'s Running Club website',
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
      `
    };
    
    // Send email
    console.log('Attempting to send email with SendGrid...');
    console.log('From:', msg.from);
    console.log('To:', msg.to);
    console.log('Subject:', msg.subject);
    
    try {
      await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid');
      res.json({ success: true, message: 'Email sent successfully' });
    } catch (sendError) {
      console.error('❌ SendGrid error details:', sendError);
      console.error('❌ SendGrid response:', sendError.response?.body);
      throw sendError;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Admin endpoints
app.post('/api/admin/login', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin authenticated' });
});

app.get('/api/admin/pending-photos', authenticateAdmin, (req, res) => {
  try {
    const photosData = readPhotosData();
    const photos = photosData.photos || [];
    const pendingPhotos = photos.filter(photo => photo.status === 'pending');
    res.json(pendingPhotos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending photos' });
  }
});

app.post('/api/admin/approve-photo/:id', authenticateAdmin, async (req, res) => {
  try {
    const photosData = readPhotosData();
    const photos = photosData.photos || [];
    const photoIndex = photos.findIndex(photo => photo.id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = photos[photoIndex];
    photos[photoIndex].status = 'approved';
    photosData.photos = photos;
    writePhotosData(photosData);
    
    // Send email notification (don't wait for it to complete)
    sendPhotoActionNotification(photo, 'approved').catch(error => {
      console.error('Failed to send photo approval notification:', error);
    });
    
    res.json({ success: true, message: 'Photo approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve photo' });
  }
});

app.post('/api/admin/reject-photo/:id', authenticateAdmin, async (req, res) => {
  try {
    const photosData = readPhotosData();
    const photos = photosData.photos || [];
    const photoIndex = photos.findIndex(photo => photo.id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Get photo details before deletion for email notification
    const photo = photos[photoIndex];
    
    // Delete the file
    const filePath = path.join(__dirname, photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from photos array
    photos.splice(photoIndex, 1);
    photosData.photos = photos;
    writePhotosData(photosData);
    
    // Send email notification (don't wait for it to complete)
    sendPhotoActionNotification(photo, 'rejected').catch(error => {
      console.error('Failed to send photo rejection notification:', error);
    });
    
    res.json({ success: true, message: 'Photo rejected and deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject photo' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dave\'s Running Club API is running',
    sendgrid: SENDGRID_API_KEY ? 'Configured' : 'Not configured'
  });
});

// Serve React app for all other routes (SPA routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Production mode: serving React app`);
  }
  if (SENDGRID_API_KEY) {
    console.log(`📧 SendGrid configured`);
  } else {
    console.log(`⚠️ SendGrid not configured - set SENDGRID_API_KEY environment variable`);
  }
});