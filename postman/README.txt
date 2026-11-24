Setup and Postman
1. Install and configure:
   - npm install
   - Copy .env.example to .env and fill PORT, MONGO_URI, JWT_SECRET (and the other values if you use the email/OTP features).
     Without .env the app falls back to port 3000 and mongodb://localhost:27017/social-app.
   - Make sure MongoDB is running.
2. Start the server: node server.js (or npx nodemon server.js). There is no "npm start" script.
3. In Postman, Import both files in this folder:
   - Social-App-2.postman_collection.json
   - Social-App-Local.postman_environment.json
4. Select the environment "Social App Local" (top right). Change baseUrl if your port is not 3000.
5. Open the collection, click Run, then Run Social App 2. It registers two fresh users, logs in, saves the tokens automatically, and tests posts, comments and the ownership rules (403 cases).
Tokens expire after 15 minutes, so run the whole collection in one go. The run adds test users and posts to your database, so use a test database.
