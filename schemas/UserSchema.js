const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true, // trim the space of the inserted value
    },
    lastName: {
      type: String,
      required: true,
      trim: true, // trim the space of the inserted value
    },

    username: {
      type: String,
      required: true,
      trim: true, // trim the space of the inserted value
      unique: true, // username cannot have duplicates
    },

    email: {
      type: String,
      required: true,
      trim: true, // trim the space of the inserted value
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePic: {
      type: String,
      default: '/images/profilePic.jpeg',
    },
  },
  { timestamps: true }
);

var User = mongoose.model('User', UserSchema); // declaire a mongoose schema for the user
module.exports = User;
