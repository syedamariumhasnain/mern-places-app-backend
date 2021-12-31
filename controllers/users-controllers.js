const uuid = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
// bcryptjs --- used to convert plane text data i.e. password into secure
// i.e. hashed and encrypted cipher text that can't be reverse engineered

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    // users = User.find({}, "email name");  // Returns email and name of all users
    users = await User.find({}, "-password"); // Returns all data fields except password of all users
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passsed, please check your data.", 422)
    );
  }

  // The data between frontent & backend should be exchanged via HTTPS
  // done by choosing correct hosting service
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    // HTTP code 422 - Invalid User Input
    const error = new HttpError(
      "Could not create user, email already exists.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    // 1st arg. is text need to be converted, 2nd arg. is no. of salting rounds
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    // id: uuid.v4(),
    name,
    email,
    // image: "http://localhost:5000/" + req.file.path,
    image: req.file.path, // uploads/images/filename
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login failed, please try again later.", 500);
    return next(error);
  }

  if (!existingUser) {
    // HTTP code 401 - Authentication Fails
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  res.json({
    message: "Logged in!",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
