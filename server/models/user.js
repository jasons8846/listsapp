const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

UserSchema.methods.getLoginDetails = function(){
  return "Hello " + this.username;
}


const User = mongoose.model("User", UserSchema);
module.exports = User;