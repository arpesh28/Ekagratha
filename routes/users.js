const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// User Login Route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// User Register Route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Login Form POST
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    }) (req, res, next);
});

// Register Form POST
router.post('/register', (req, res) => {
    let errors = [];

    if(req.body.password1 != req.body.password2){
        errors.push({text: 'Passwords do not match'});
    }

    if(req.body.password1.length < 8){
        errors.push({text:'Password must be at least 8 characters'});
      }

    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            firstName:req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password1: req.body.password1,
            password2: req.body.password2
        });
    }  else{
        User.findOne({email:req.body.email})
            .then(user => {
                if(user){
                    req.flash('error_msg', 'Email already registered');
                    res.redirect('/register');
                } else {
                    const newUser = new User({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password:req.body.password1
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash( newUser.password, salt, (err,hash) => {
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/login');
                                })
                                
                        });
                    });
                }
            });
    }
    });





module.exports = router;