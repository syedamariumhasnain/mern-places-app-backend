// Controllers for LOGIC / MIDDLEWARE FUNCTIONS

const uuid = require("uuid");
const HttpError = require("../models/http-error");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ place }); // => { place } => { place: place }
}

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((u) => u.creator === userId);

  if (!place) {
    return next(new HttpError("Could not find a place for the provided user id.", 404));
  }

  res.json({ place });
}

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body; 
  // Extracting data by object destructuring. Similar to:
  // const title = req.body.title;
  const createdPlace = {
    id: uuid.v4(),
    title,  // => title => (similar to) => title: title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace);  // unshift(createPlace) -- to put at first index 
  
  // status 200 -- normal success
  // status 201 -- something created successfully 
  res.status(201).json({place: createdPlace});
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;