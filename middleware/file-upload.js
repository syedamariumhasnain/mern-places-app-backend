const multer = require("multer");
const uuid = require("uuid");

const MIME_TYPE_MAP = {
  "image/png" : "png",
  "image/jpeg" : "jpeg",
  "image/jpg" : "jpg",
}

const fileUpload = multer({
  limits: 500000,  // 500 KiloByte
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      // Here, we can dynamically check for the mimetype of file
      // we receive in the list of MIME_TYPE we define. 
      // The callback can take 1st arg error, but this is not 
      // the case here. 2nd arg is file name (unique).
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid.v4() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    // search file.mimetype in MIME_TYPE_MAP and returns boolean 
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");

    // error as 1st arg, if fails the validation OR
    // null as 1st arg, if succeed
    cb(error, isValid);
  }
});

module.exports = fileUpload;