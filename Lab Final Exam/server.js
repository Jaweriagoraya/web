// This file is just a helper to start the actual server.
// It changes the directory to the correct folder and starts the app.

console.log("Starting server from the 'final lab' folder...");

// Change the current working directory to where the actual code is
process.chdir(__dirname + '/final lab');

// Require the actual server script located in the inner folder
require('./final lab/server.js');
