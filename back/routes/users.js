var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt")
var User = require("../models/User")
//var multer  = require('multer')
var path = require("path")

//var upload = multer({ dest: path.join(__dirname, '../public/images/') })
router.post("/get-user", (req, res)=> {
  if(req.session.user) {
    res.status(200).json(req.session.user)
  } else {
    res.status(403).json({message: "Not logged in"})
  }
})


router.post('/signup', function(req, res, next) {
  debugger
  const {name, email, password} = req.body

  // front end validation
  if(!name || !email || !password) {
    res.status(400).json({
      message: "Please, fill all the fields"
    })
  }
  if (password.length < 4) {
    res.status(400).json({ 
      message: 'Please make your password at least 4 characters long for security purposes.' });
  } else {
    User.find({name: req.body.name})
        .then((user)=> {
            if(user.length > 0) {
            res.status(403).json({message: "Username already taken"})
          } else {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(req.body.password, salt, function(err, hash) {
              if(err) res.status(500).json({message: err})
              else {

                User.create({
                  name: name,
                  email: email,
                  password: hash,
                
                })
                .then((data)=> {
                  debugger
                  res.status(200).json({data, message: "Signed up"})
                })
                .catch((err)=> {
                  res.status(500).json({message: err})
                })
              }
          });
        });
      }
    })
  }
      
});


router.post('/login', function(req, res, next) {
  debugger
  User.findOne({name: req.body.name})
    .then((user)=> {
      if(user) {
        bcrypt.compare(req.body.password, user.password, function(err, match){
          if(err) res.status(500).json({message: err}) 
          else if(match) {
            delete user.password
            req.session.user = user
    
            // res.set({
            //     "Access-Control-Expose-Headers": "ETag",
            //     "Access-Control-Allow-Origin": "http://localhost:3000",
            //     "Access-Control-Allow-Credentials": true,
            //     "session": "true"
            // })
            res.status(200).json({message: "Logged in"})
          } else {
            res.status(403).json({message: "Invalid credentials"})
          }
        })
      } else {
        debugger
        res.status(403).json({message: "Invalid credentials"})
      }
    })
    .catch((err)=> {
      res.status(500).json({message: err}) 
    })
});




router.post("/logout", (req, res)=> {
  if(req.session.user) {
    req.session.destroy()
    res.status(200).json({message: "Logged out"})
  } else {
    res.status(403).json({message: "Not logged in"})
  }
})

module.exports = router;

//router.post("/update", upload.single('profilePic'), (req, res)=> {
//  debugger
//  User.findOneAndUpdate({_id: req.session.user._id}, {profilePic: req.file.filename}, {new: true},)
//    .then((updatedUser)=> {
//      let newSession = req.session.user
//      newSession.profilePic = updatedUser.profilePic
//      req.session.user = newSession
//      debugger
//      res.status(200).json({message: "User updated"})
//    })
//    .catch((err)=> {
//      res.status(500).json({err: err})
//    })
//})