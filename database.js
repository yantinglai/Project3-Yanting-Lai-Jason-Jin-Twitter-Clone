const { Data } = require('hexo/lib/models');
const mongoose = require('mongoose');
// The require("mongoose") call will return a Singleton object
// Singleton object means that the first time we call require('mongoose)
// it is creating an instance of the Mongoose class and returning it.
// On seseqent calls, it will return the same instance that was created
// and returned to you the first time because that's how module import/export works in ES6

class Database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(
        'mongodb+srv://admin:dbuserpassword@clusters.rmgjjov.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority'
      )
      .then(() => {
        console.log('database connection successful');
      })
      .catch((err) => {
        console.log('database connection error' + err);
      });
  }
}
module.exports = new Database();
