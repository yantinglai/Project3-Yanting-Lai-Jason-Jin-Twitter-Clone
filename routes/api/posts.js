const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', async (req, res, next) => {
  var results = await getPosts({});
  res.status(200).send(results);
});

router.get('/:id', async (req, res, next) => {
  var postId = req.params.id;

  var postData = await getPosts({ _id: postId });
  postData = postData[0];

  var results = {
    postData: postData,
  };

  if (postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  res.status(200).send(results);
});

router.post('/', async (req, res, next) => {
  // make sure when users submit data, it gets handled in the backend

  if (!req.body.content) {
    console.log('Alert! There is no content param sent with request');
    return res.sendStatus(400);
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: 'postedBy' });
      res.status(201).send(newPost);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

async function getPosts(filter) {
  var results = await Post.find(filter)
    .populate('postedBy')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .catch((error) => console.log(error));

  results = await User.populate(results, { path: 'replyTo.postedBy' });
  return await User.populate(results, { path: 'postedBy' });
}

module.exports = router;
