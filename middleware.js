// create middleware to verify whether user has logged in or not before performing any activities
exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect('/login');
  }
};
