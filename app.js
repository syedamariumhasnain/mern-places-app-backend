const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
// const usersRouters = require("./routes/users-routes");

const app = express();

app.use("/api/places", placesRoutes); //  => /api/places/...
// app.use("/api/users", usersRouters);

// Special Middleware function with 4 args is considered as error handling 
// middleware function by express, having first arg "error"
// This function will only be executed on the requests that have an error 
// attached to it, when any middleware function infront of it yeilds an error
app.use((error, req, res, next) => {
  if(res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || "An unknown error occurred!"})
});

app.listen(5000);