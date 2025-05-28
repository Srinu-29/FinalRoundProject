const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String },
  mobile_number: { type: String },
  createdAt: { type: Date, default: Date.now },
  modules: [
  {
    moduleId: { type: String, required: true },
    ModuleCompleted: { type: String, enum:["started","completed","not started"],default:"not started" },
    codes: {
      htmlcode: { type: String },
      csscode: { type: String },
      jscode: { type: String },
    }
  }
],


  bio:
  {
    type:String,
  },
  
});

module.exports = mongoose.model('User', userSchema);