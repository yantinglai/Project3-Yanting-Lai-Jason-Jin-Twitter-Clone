const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', async (req, res, next) => {
  var searchObj = req.query;

  if (!req.session.user) {
    return res.status(401).send({
      success: false,
      message: 'You must be logged in to view the newsfeed',
    });
  }
  if (searchObj.isReply !== undefined) {
    var isReply = searchObj.isReply == 'true';
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  if (searchObj.search !== undefined) {
    searchObj.content = { $regex: searchObj.search, $options: 'i' };
    delete searchObj.search;
  }

  if (searchObj.followingOnly !== undefined) {
    var followingOnly = searchObj.followingOnly == 'true';

    if (followingOnly) {
      var objectIds = [];
      // if nobody is following you, set as empty array

      if (!req.session.user.following) {
        req.session.user.following = [];
      }

      req.session.user.following.forEach((user) => {
        objectIds.push(user);
      });
      // can see our own posts in the newsfeed
      objectIds.push(req.session.user._id);
      searchObj.postedBy = { $in: objectIds };
    }

    delete searchObj.followingOnly;
  }

  var results = await getPosts(searchObj);
  res.status(200).send(results);
});

router.get('/:id', async (req, res, next) => {
  var postId = req.params.id;

  var postData = await getPosts({ _id: postId });
  postData = postData[0];

  var results = {
    postData: postData,
  };

  if (postData.replyTo === undefined) {
    console.log('cannot find postData');
  }
  if (postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  res.status(200).send(results);
});
/*
------------------------------------------------------------------------------------------------
*/
// get orginal content
router.get('/getOriginalContent', async (req, res) => {
  try {
    const postId = req.query.postId; // Fetch the post ID from query parameter
    const post = await Post.findById(postId); // Fetch the post by ID
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Extract the content from the fetched post
    const content = post.content;

    // Return the content in the response
    res.json({ content: content });
  } catch (error) {
    console.error('Error fetching original content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
/*
------------------------------------------------------------------------------------------------
*/
router.post('/', async (req, res, next) => {
  if (!req.body.content) {
    console.log('Content param not sent with request');
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

router.put('/:id', async (req, res, next) => {
  if (!req.body.content) {
    console.log('Content param not sent with request');
    return res.sendStatus(400);
  }

  const postId = req.params.id;
  const updatedContent = req.body.content;

  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { content: updatedContent },
      { new: true } // Return the updated post
    ).populate('postedBy');

    if (!updatedPost) {
      res.sendStatus(404); // Not found
    } else {
      res.status(200).send(updatedPost);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.put('/:id/like', async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  var isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  var option = isLiked ? '$pull' : '$addToSet';

  // Insert user like
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // Insert post like
  var post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});
// edit post
router.put('/:id/edit', async (req, res, next) => {
  var postId = req.params.id;
  var updatedContent = req.body.content; // Assuming the updated content is sent in the request body

  // Check if updated content is present in the request body
  if (!updatedContent) {
    console.log('Updated content not sent with request');
    return res.sendStatus(400);
  }

  // Update the post with the new content
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { content: updatedContent },
      { new: true }
    );

    // Populate any required fields before sending the updated post in the response
    await User.populate(updatedPost, { path: 'postedBy' });

    res.status(200).send(updatedPost);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.post('/:id/retweet', async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  // Try and delete retweet
  var deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  var option = deletedPost != null ? '$pull' : '$addToSet';

  var repost = deletedPost;

  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (error) => {
        console.log(error);
        res.sendStatus(400);
      }
    );
  }

  // Insert user like
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: repost._id } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // Insert post like
  var post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

router.delete('/:id', (req, res, next) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.put('/:id', async (req, res, next) => {
  if (req.body.pinned !== undefined) {
    await Post.updateMany(
      { postedBy: req.session.user },
      { pinned: false }
    ).catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
  }

  Post.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

async function getPosts(filter) {
  var results = await Post.find(filter)
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .catch((error) => console.log(error));

  results = await User.populate(results, { path: 'replyTo.postedBy' });
  return await User.populate(results, { path: 'retweetData.postedBy' });
}

module.exports = router;
