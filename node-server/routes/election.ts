import express from 'express';
import path = require('path');
import { solve, Vote } from "../solveLogic";

const router = express.Router();

router.post('/election', (req, res) => {
  const body = req.body;
  console.log(body)
  let response =  Array.from(solve((body as any) as Array<Vote>)).join("\n")
  console.log(response)
  res.json(response);
});

router.get('/election-form', (_req, res) => {
  res.sendFile(path.resolve('index.html'));
});

router.get('/calculate', (req, res) => {
  const body = req.body
  res.json(body); 
});


export default router;