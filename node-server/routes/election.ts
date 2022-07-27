import express from 'express';
// const path = require('path');
const Vote = require('../models/vote')
import { solve, Vote } from "../solveLogic";

const router = express.Router();

router.post('/election', async (req, _res) => {
  const body = req.body[0];
  console.log('req body', body)

  if(body.voter == "" || body.weight <= 0) return;
  
  const stringVote = JSON.stringify(body);
  console.log('dbString', stringVote)

  const vote = new Vote({ vote: stringVote })

  await vote.save();

});

// router.get('/election-form', (_req, _res) => {
//   res.sendFile(path.resolve('public/index.html'));
// });

router.get('/calculate', async (_req, res) => {
  const votes = await Vote.find({}, { vote: 1, _id: 0 } );
  console.log('bazidan amoReba', votes)

  const voteObj = votes.map((v: any) => JSON.parse(v.vote));
  console.log('algoritmistvis', voteObj)

  let response =  Array.from(solve((voteObj as any) as Array<Vote>)).join("\n")
  console.log(response)
  res.json(response);
});


export default router;