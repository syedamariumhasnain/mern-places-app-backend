const uuid = require("uuid");
const { validationResult } = require("express-validator");

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

  const { name, email, password } = req.body;

  const createdUser = new User({
    // id: uuid.v4(),
    name,
    email,
    image:
      "https://cdn2.vectorstock.com/i/thumb-large/41/11/flat-business-woman-user-profile-avatar-icon-vector-4334111.jpg",
    password,
    places: [],
  });

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    if (existingUser) {
      // HTTP code 422 - Invalid User Input
      const error = new HttpError(
        "Could not create user, email already exists.",
        422
      );
      return next(error);
    }
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
    if (!existingUser || existingUser.password !== password) {
      // HTTP code 401 - Authentication Fails
      const error = new HttpError(
        "Could not identify user, credentials seem to be wrong",
        401
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError("Login failed, please try again later.", 500);
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
