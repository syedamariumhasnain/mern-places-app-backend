// A Class is a blue print for JS Object
class HttpError extends Error {
  constructor(message, errorCode) {
    // super - to call the constructor of base class "Error" & forward message to it
    super(message);  // Add a "message" property
    this.code = errorCode;  //Adds a "code" property
  }
}

module.exports = HttpError;