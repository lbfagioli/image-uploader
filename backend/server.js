const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        mimetype VARCHAR(50),
        size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table checked/created');
  } catch (err) {
    console.error('DB Init Error:', err);
  }
};
initDB();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});


app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded or invalid type' });

  try {
    const { filename, originalname, mimetype, size } = req.file;
    
    await pool.query(
      'INSERT INTO images (filename, original_name, mimetype, size) VALUES ($1, $2, $3, $4)',
      [filename, originalname, mimetype, size]
    );

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    
    res.json({
      message: 'Upload successful',
      url: imageUrl,
      filename: filename
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));