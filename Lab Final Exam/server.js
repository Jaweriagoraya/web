// This file is just a helper to start the actual server.
// It changes the directory to the correct folder and starts the app.

console.log("Starting server from the 'Assignment 04 LAB web' folder...");

// Change the current working directory to where the actual code is
process.chdir(__dirname + '/Assignment 04 LAB web');

// Require the actual server script located in the inner folder
require('./Assignment 04 LAB web/server.js');
