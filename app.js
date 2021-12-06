const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
// const usersRouters = require("./routes/users-routes");

const app = express();

app.use("/api/places", placesRoutes); //  => /api/places/...
// app.use("/api/users", usersRouters);

app.listen(5000);