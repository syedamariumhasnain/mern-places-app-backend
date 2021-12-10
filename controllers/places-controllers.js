// Controllers for LOGIC / MIDDLEWARE FUNCTIONS

const uuid = require("uuid");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId).exec();
  } catch(err) {
    const error = new HttpError("Something went wrong, could not find a place", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find a place for the provided id.", 404);
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  
  let places;
  try {
    // Place.find() ==> Returns all the places we have in our database
    places = await Place.find({ creator: userId }).exec();
  } catch(err) {
    const error = new HttpError("Fetching places failed, please try again later", 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find places for the provided user id.", 404));
  }

  res.json({ places: places.map(place => place.toObject({ getters: true })) });
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors);
    // Woking with express, throw will not work correctly with async func.
    // So we wil always use next in async function
    return next(new HttpError("Invalid inputs passsed, please check your data.", 422));
  }
  
  const { title, description, address, creator } = req.body; 

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch(error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "https://images.unsplash.com/photo-1528291151377-165f5107c82a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&w=1000&q=80",
    creator
  });

  let user;
  try {
    user = await User.findById(creator);

    if(!user) {
      const error = new HttpError("Could not find user for provided id", 404);
      return next(error);
    }
    console.log(user);

    // Creating Session to perform related operations independenly in a single transction
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch(err) {
    // HTTP code 500 - Internal Server Error
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }
  
  res.status(201).json({place: createdPlace});
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors);
    return next(HttpError("Invalid inputs passsed, please check your data.", 422));
  }
  
  const { title, description } = req.body; 
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);

    place.title = title;
    place.description = description;

    await place.save();
  } catch(err) {
    const error = new HttpError("Something went wrong, could not update place.", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try { 
    place = await Place.findById(placeId);
    await place.remove();
  } catch(err) {
    const error = new HttpError("Something went wrong, could not delete place.", 500);
    return next(error);
  }
  
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace; 