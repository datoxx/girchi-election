import dotenv from 'dotenv';
import https  from 'https';
import fs from 'fs';
import cors from 'cors';
import express from 'express';
const mongoose = require('mongoose');

import elecion from './routes/election';
import user from './routes/user';

dotenv.config();

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());


const MONGODB_URI = process.env.DB_URI;
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error: any) => {
    console.log('error connection to MongoDB:', error.message)
  })


app.use('/', elecion);
app.use('/', user);


const PORT = process.env.PORT || 8888;
if(process.env.ENVIROMENT === 'local'){
    https.createServer({
        key: fs.readFileSync(<string>process.env.SSL_KEY),
        cert: fs.readFileSync(<string>process.env.SSL_CERT),
    }, app).listen(PORT, () => {console.log(`Server listening on ${PORT}`)});
} else {
    app.listen(PORT, () => {console.log(`Server listening on ${PORT}`)});
}