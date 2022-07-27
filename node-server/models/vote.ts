const mongoose = require('mongoose')


const voteSchema = new mongoose.Schema({
    vote: String,
  })
    
  voteSchema.set('toJSON', {
    transform: (returnedObject: any) => {
      // returnedObject.id = returnedObject._id.toString()
      // returnedObject.vote = returnedObject.vote.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
  module.exports = mongoose.model('Vote', voteSchema)