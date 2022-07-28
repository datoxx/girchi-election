import express from 'express';
import cors from 'cors';
const mongoose = require('mongoose');

import elecion from './routes/election';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8888;

const MONGODB_URI = 'mongodb+srv://datoxx:datoxx123@fullstack.sqve7.mongodb.net/girchi-election?retryWrites=true&w=majority';
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error: any) => {
    console.log('error connection to MongoDB:', error.message)
  })


app.use('/', elecion);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});