const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));
router.get('/', async (req, res, next) => {
  var searchObj = req.query;

  if (req.query.search !== undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
      ],
    };
  }
  User.find(searchObj)
    .then((result) => res.status(200).send(result))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

// update the userId when user hit the follow button
router.put('/:userId/follow', async (req, res, next) => {
  var userId = req.params.userId;

  var user = await User.findById(userId); // check if the userId exists

  if (user == null) return res.sendStatus(404); // if no user found, send 404 status

  // ifFollowing : bool
  // check if user has followers and if the logged in userId exists in the user followers list
  var isFollowing =
    user.followers && user.followers.includes(req.session.user._id);
  var option = isFollowing ? '$pull' : '$addToSet'; // if true, take away from list, else add to list

  // update the following list
  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    { [option]: { following: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // update the followers list
  User.findByIdAndUpdate(userId, {
    [option]: { followers: req.session.user._id },
  }).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  res.status(200).send(req.session.user);
});

// get following list when clicking on following button
router.get('/:userId/following', async (req, res, next) => {
  User.findById(req.params.userId)
    .populate('following')
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

// get followers list when clicking on followers button
router.get('/:userId/followers', async (req, res, next) => {
  User.findById(req.params.userId)
    .populate('followers')
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

// update the user profile picture
router.post(
  '/profilePicture',
  upload.single('croppedImage'),
  async (req, res, next) => {
    if (!req.file) {
      console.log('No file uploaded with ajax request.');
      return res.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

// update the user image upload
router.post(
  '/coverPhoto',
  upload.single('croppedImage'),
  async (req, res, next) => {
    if (!req.file) {
      console.log('No file uploaded with ajax request.');
      return res.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { coverPhoto: filePath },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

module.exports = router;
