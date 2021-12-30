const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

// This middleware extracts the json data from any incomming request's body,
// convert in regular JS data structure (object, array, ...) and automatically
// call next(), to reach next middleware inline
app.use(bodyParser.json());

// express.static() -- returns special middleware build into express
// this middleware returns requested file. static serving means just 
// returning a file, don't execute it.
// It takes arg. that defines which files in which folders express static
// can return. the arg. is a path pointing at the folder that serve files
// This path has to be absolute path, we can built with path module. so, 
// the other files are locked down but files in this folder are accessable
// when reequested.
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes); //  => /api/places/...
app.use("/api/users", usersRoutes);

// Error Handling for unsupported routes
app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

// Default Error Handler
app.use((error, req, res, next) => {
  if(req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    })
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    "mongodb+srv://marium:marium27@cluster0.q2val.mongodb.net/mern_places_app?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));
