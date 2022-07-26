import express from 'express';
import cors from 'cors';
import elecion from './routes/election';
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8888;

app.use('/', elecion);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});