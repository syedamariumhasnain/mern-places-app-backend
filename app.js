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

app.use("/api/places", placesRoutes); //  => /api/places/...
app.use("/api/users", usersRoutes);

// Error Handling for unsupported routes
app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

// Default Error Handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    "mongodb+srv://marium:marium27@cluster0.q2val.mongodb.net/places_app?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000))
  .catch(err => console.log(err));
