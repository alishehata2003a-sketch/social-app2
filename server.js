const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoute = require('./src/routes/auth.route');
const userRoute = require('./src/routes/user.route');
const followRoute = require('./src/routes/follow.route');
const postRoute = require('./src/routes/post.route');
const commentRoute = require('./src/routes/comment.route');




const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/follow', followRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);


// Database Connection & Server Running
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/social-app';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });