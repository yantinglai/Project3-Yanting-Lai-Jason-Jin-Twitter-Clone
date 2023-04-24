// Import required packages and middleware
const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session');

// Start the server and listen on the specified port
const server = app.listen(port, () =>
  console.log('Server listening on port ' + port)
);

// Set the view engine and views directory
app.set('view engine', 'pug');
app.set('views', 'views');

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Define session
app.use(
  session({
    secret: 'bbq chips',
    resave: true,
    saveUninitialized: false,
  })
);

// Define routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const logoutRoute = require('./routes/logout');

// Api routes for difference pages
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');

// Use routes
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/posts', middleware.requireLogin, postRoute);
app.use('/profile', middleware.requireLogin, profileRoute);
app.use('/uploads', uploadRoute);
app.use('/search', middleware.requireLogin, searchRoute);

app.use('/api/posts', postsApiRoute);
app.use('/api/users', usersApiRoute);
app.use('/logout', logoutRoute);

// Define the home page route
app.get('/', (req, res, next) => {
  var payload = {
    pageTitle: 'Home',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render('home', payload);
});
