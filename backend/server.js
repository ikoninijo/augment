const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'safaricad.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SafariCAD API is running' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Authentication error' });
    }
  });
});

// Projects routes
app.get('/api/projects', authenticateToken, (req, res) => {
  const query = `
    SELECT p.*, u.username as owner_username 
    FROM projects p 
    JOIN users u ON p.owner_id = u.id 
    WHERE p.owner_id = ? OR p.id IN (
      SELECT project_id FROM project_collaborators WHERE user_id = ?
    )
    ORDER BY p.updated_at DESC
  `;
  
  db.all(query, [req.user.id, req.user.id], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(projects);
  });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name required' });
  }

  const query = 'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)';
  db.run(query, [name, description, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.status(201).json({
      id: this.lastID,
      name,
      description,
      owner_id: req.user.id,
      status: 'active'
    });
  });
});

// Drawings routes
app.get('/api/projects/:projectId/drawings', authenticateToken, (req, res) => {
  const { projectId } = req.params;
  
  const query = `
    SELECT d.*, u.username as created_by_username 
    FROM drawings d 
    JOIN users u ON d.created_by = u.id 
    WHERE d.project_id = ? AND d.is_active = 1
    ORDER BY d.updated_at DESC
  `;
  
  db.all(query, [projectId], (err, drawings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(drawings);
  });
});

app.post('/api/projects/:projectId/drawings', authenticateToken, (req, res) => {
  const { projectId } = req.params;
  const { name, description, drawing_data } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Drawing name required' });
  }

  const query = 'INSERT INTO drawings (project_id, name, description, drawing_data, created_by) VALUES (?, ?, ?, ?, ?)';
  db.run(query, [projectId, name, description, JSON.stringify(drawing_data || {}), req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.status(201).json({
      id: this.lastID,
      project_id: projectId,
      name,
      description,
      drawing_data: drawing_data || {},
      created_by: req.user.id
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SafariCAD Backend running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
});
