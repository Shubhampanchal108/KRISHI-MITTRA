const express = require('express');
const app = express();
const env = require('dotenv').config()
const DB_Connection = require('./Connections/Database')
const cors = require('cors')
const Routes = require('./Routes/Routes')


//Cors
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

//PORT
const PORT = process.env.PORT || 3000;


//Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/main', Routes);

// server running
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  DB_Connection()
});