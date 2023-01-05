# RexArt
Social Media platform where users can post artwork's using image URL's and create workshops where users can enroll.


Installation, initialization/running database, and server
- Open a terminal in the directory of the server.js file
- How to install:
o To begin, install all the necessary dependencies by using the following
command:
▪ > npm install
o Then you need to start the database. To do this, run the following command:
▪ > mongod --dbpath='data/db'
o Once the database is launched, you will need to initialize it. To do this, open
a new terminal in the same directory and run the following command:
▪ > node .\database-initializer.js
▪ You might see some warnings, but this is not because of the code,
It is simply because of the importing of modules.
o Once that is finished you will see that the database connection is closed.
o Now we can run the server. Use the following command:
▪ > node .\server.js
▪ Same thing applies for the warnings
o Now head to http://localhost:3000
