const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: { type: String, required: true },
    profilePic: { type: String, default: '/images/profilePic.jpeg' },
    coverPhoto: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
