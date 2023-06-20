import mongoose from "mongoose";
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mail: { type: String, required: true, unique: true, lowercase: true },
  salt: { type: String, required: true },
  hash: { type: String, required: true },
  posts: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Post" }],
});

// no arrow functions here!
userSchema.methods.setPassword = function (password) {
  // salt 
  this.salt = crypto.randomBytes(64).toString('hex');
  // hash password with salt 
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.verifyPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');

  return this.hash === hash;
}

export const User = mongoose.model("User", userSchema)
