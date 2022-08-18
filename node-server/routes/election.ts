import express from 'express';
const Vote = require('../models/vote')
const { v1: uuid } = require('uuid')
import { solve, Vote } from "../solveLogic";

const router = express.Router();

router.post('/election', async (req, res) => {
  const body: any = req.body;
  // am momentistvis uuids ar viyeneb ukve arsebuli vouterebis sanaxavad bazaSi.
  const generatedId = uuid();
  console.log("generirebuli id",generatedId);
  console.log('req body', body)
  
  const voters = await Vote.find({});
  const votersName = voters.find((v:any)=> JSON.parse(v.vote).voter === body.voter)

  const stringVote = JSON.stringify(body);
  console.log('dbString', stringVote)

  if(votersName) {
    const voterChange = await Vote.findByIdAndUpdate(votersName._id, { vote: stringVote }, {new: true})  
   return res.status(200).json(voterChange.vote);
  }

  const vote = new Vote({ 
    vote: stringVote,
    id: generatedId
  });

 const newVoteSave =  await vote.save();
 return res.status(200).json(newVoteSave.vote);

});

router.get('/election/:id', async (req, res) => {
  const reqId = req.params.id;
  console.log('reqId', reqId)

  const voters = await Vote.find({}, { vote: 1, id: 1, _id: 0 } );
  const foundVoter: any = voters.find((v:any)=> v.id === reqId)

  console.log( "napovni vouteri aidiT", foundVoter)
 
  const responsObj = JSON.parse(foundVoter.vote);

  res.json(responsObj);
});

router.get('/calculate', async (_req, res) => {
  const votes = await Vote.find({}, { vote: 1, _id: 0 } );
  console.log('bazidan amoReba', votes)

  const voteObj = votes.map((v: any) => JSON.parse(v.vote));
  console.log('algoritmistvis', voteObj)

  let response =  Array.from(solve((voteObj as any) as Array<Vote>)) 
  // .slice(-3)
  console.log("algortimidan gamosuli",response)
  res.json(response);
});


export default router;