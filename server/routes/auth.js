// const express=require('express');
// const router=express.Router();
// const passport=require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User=require('../models/user')
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CALLBACK_URL
//   },
//     async function(accessToken, refreshToken, profile, done) {
//     const newUser={
//         googleId:profile.id,
//         displayName:profile.displayName,
//         firstName:profile.name.givenName,
//         lastName:profile.name.familyName,
//         profileImage:profile.photos[0].value
//     }

//     try {
//        let user= await User.findOne({googleId:profile.id });
//        if(user){
//         done(null,user);
//        } 
//        else{
//         user=await User.create(newUser);
//         done(null,user);
//        }
//     } catch (error) {
//        console.log(error) 
//     }

//   }
// ));


// router.get('/auth/google',
//     passport.authenticate('google', { scope: ['email','profile'] }));
  
// router.get('/google/callback', 
//     passport.authenticate('google', { 
//         failureRedirect: '/login-failure',
//         successRedirect:'/dashboard'
//          })

// );

// //routes goes something wrong here
// router.get('/login-failure',(req,res)=>{
//     res.send('something went wrong....')
// })


// //persisit user data after successfull authonticatication
// passport.serializeUser(function(user,done){
//     done(null,user.id);
// })

// //retrive user data from session
// passport.deserializeUser(function(id,done){
//     user.FindById(id,function(err,user){
//         done(err,user);
//     })
// })


// module.exports=router;

const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config(); // Ensure environment variables are loaded

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async function (accessToken, refreshToken, profile, done) {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profileImage: profile.photos[0].value
    };

    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        done(null, user);
      } else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (error) {
      console.log(error);
      done(error, null); // Call done with error
    }
  }
));

// Google Login Route
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failure',
    successRedirect: '/dashboard'
  })
);

// Route if something goes wrong
router.get('/login-failure', (req, res) => {
  res.send('Something went wrong...');
});


router.get('/logout',(req,res)=>{
    req.session.destroy(error=>{
        if(error){
            console.log(error);
            res.send('error login out')
        }else{
            res.redirect('/')
        }
    })
})

// Persist user data after successful authentication
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Retrieve user data from session
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id); // Corrected this line
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = router;
