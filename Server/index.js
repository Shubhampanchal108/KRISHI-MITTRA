const express = require('express');
const app = express();
const env = require('dotenv').config()
const DB_Connection = require('./Connections/Database')
const cors = require('cors')
const path = require('path')
const Routes = require('./Routes/Routes')


//Cors
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

//PORT
const PORT = process.env.PORT || 3000;


//Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'Middlewares', 'uploads')))


//Routes
app.get('/', (req, res) => {
  res.send('Krishi Mittra server is Running...');
});
app.use('/api/main', Routes);

// Global Express Error Middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error("Internal Server Error:", err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
  });
});

// Process Level Exception Safety
process.on('uncaughtException', (err) => {
  console.error("CRITICAL: Uncaught Exception detected:", err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

// server running
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server is running on port ${PORT}`);
  }
  DB_Connection();
});
