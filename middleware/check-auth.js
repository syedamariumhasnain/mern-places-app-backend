const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error"); 

// here, we expect to get the token in headers, cuz all requests 
// like get, delete don't have request body. alternate is using
// query parameters ?token=some_user_token

module.exports = (req, res, next) => {
  try {
    // Authorization: "Bearer YOUR_TOKEN_STRING"
    const token = req.headers.authorization.split(" ")[1];
    // if authorization is undefined in case, can be catch in 
    // our catch block

    if (!token) {
      throw new Error("Authentication failed!");
    }

    // verifying token using jwt, as we have generated the token
    // using the same. jwt.verify() returns a string or an object.
    // It returns the payload that was encoded into the token
    // So, our token should return userId and email
    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    // if verification fails in case, can be catch in our catch block

    // we can always add data dynamically to the request object
    req.userData = { userId: decodedToken.userId };

    // if user passes all these checks successfully, is then allowed
    // to access pass and go to next middleware
    next();

  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }  
}