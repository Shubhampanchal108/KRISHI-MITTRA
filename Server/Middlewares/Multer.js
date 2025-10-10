const multer = require('multer')

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:\\Users\\j\\OneDrive\\Desktop\\shubham studio\\KRISHI MITTRA\\Server\\uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

module.exports = upload


