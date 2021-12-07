const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

// if we had somthing specific like "/user" then we will put it
// above this "/:pid" route, to handle that specific case and
// not considered as some "pid" has a value "user"

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    // 2 Things we can do, either throw error or pass it using to next
    // In asynchronous code, we need to use next to pass error through and, 
    // In synchronous code, we can just simply throw the error
    const error = new Error("Could not find a place for the provided id.");
    error.code = 404;
    throw error;
    // next(error);
  }

  res.json({ place }); // => { place } => { place: place }
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((u) => u.creator === userId);

  if (!place) {
    const error = new Error("Could not find a place for the provided user id.");
    error.code = 404;
    // throw error;
    return next(error);
    // Note: here if we don't return at this statement the next statement 
    // res.json({...}) will also be executed, causing two diff. responses, 
    // hence generating error at the backend.
  }

  res.json({ place });
});

module.exports = router;
