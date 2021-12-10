const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Syeda Marium",
    email: "test@test.com",
    password: "#testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors);
    return next(new HttpError("Invalid inputs passsed, please check your data.", 422));
  }
  
  const { name, email, password, places } = req.body;

  const createdUser = new User({
    // id: uuid.v4(),
    name,
    email,
    image: "https://cdn2.vectorstock.com/i/thumb-large/41/11/flat-business-woman-user-profile-avatar-icon-vector-4334111.jpg",
    password,
    places
  });

  let existingUser; 
  try {
    existingUser = await User.findOne({ email: email });
    if(existingUser) {
      // HTTP code 422 - Invalid User Input
      const error = new HttpError("Could not create user, email already exists.", 422);
      return next(error);
    }
    await createdUser.save();
  } catch(err) {
    const error = new HttpError("Signing up failed, please try again later.", 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    // HTTP code 401 - Authentication Fails
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong", 401
    );
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
