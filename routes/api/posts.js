const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {});

router.post('/', async (req, res, next) => {
  // make sure when users submit data, it gets handled in the backend
  if (!req.body.content) {
    console.log('Content param not sent with req');
    return res.sendStatus(400);
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: 'postedBy' });
      res.status(201).send(newPost); // 201: resource successfully created
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = router;
