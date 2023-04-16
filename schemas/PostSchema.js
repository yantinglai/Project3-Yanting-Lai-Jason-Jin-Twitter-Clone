const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    //pin the user post
    pinned: Boolean,
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  { timestamps: true }
); // add timestamp

var Post = mongoose.model('Post', PostSchema); // declaire a mongoose schema for the user
module.exports = Post;
