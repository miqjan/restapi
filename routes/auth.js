import express from 'express';
import { transaction } from 'objection';
import validator  from 'express-validator';

import User from '../models/UserModel';
import VaEmail from '../models/VerificationEmailsModel';

var router = express.Router();

router.use(validator());
router.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
router.use(checkAuthentication);

router.get('/user', MustBeSignin, async (req,res,next)=>{
    try {
        res.json(req.user);
    } catch (error) {
        return next(error);
    }
});

router.post('/signin', NotMustBeSignin, async (req, res, next)=> {  
    try {
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        await req.asyncValidationErrors();
        //.catch(error=>{return next(new Error(ValidationErrorsShow(error)));});
        let user = await User.Signin(req.body.email,req.body.password);
        let the_user = new User(user);
        res.json(await the_user.GetUser());
    } catch (error) {
        //when error is validation error in the server error middleware have an if(error instanse of Arrey)
        return next(error);
    }
});

router.post('/signinfacebook',NotMustBeSignin, async (req,res,next)=>{
    try {
        req.checkBody('accessToken', 'accessToken is required').notEmpty();
        await req.asyncValidationErrors();
        let accessTokenfacebook = req.body.accessToken;
        let facebook_user = await User.GetUserByFacebookSuccessToken(accessTokenfacebook);
        facebook_user.password = (Math.random() *10000).toString(16);
        let user_and_token = await User.SignInFacebookUser(facebook_user);
        let the_user = new User(user_and_token);
        res.json(await the_user.GetUser());
    } catch (error) {
        return next(error);
    }
});

router.post('/sendemail', NotMustBeSignin, async function(req, res,next) {  
    try {
        req.checkBody('email', 'valid email is required').isEmail();
        await req.asyncValidationErrors();
        let email = req.body.email;
        if(!(await User.IsEmailExist(email))){
            let info = await VaEmail.SendMail(email);
            if(info) res.json(info);
        } else {
            throw new Error('Email exist');
        }
    } catch (error) {
        return next(error);
    }
});

router.get('/verifemail/:kay', NotMustBeSignin, async function(req, res, next) {  
    try {
        req.checkParams('kay','is required').notEmpty();
        await req.asyncValidationErrors();
        let verificate_ed = await VaEmail.EmailVerificate(req.params.kay);
        if(verificate_ed){
            res.json(verificate_ed);
        }
    } catch (error) {
        return next(error);
    }
});

router.post('/signupcallback',NotMustBeSignin, async function(req, res,next) {  
    try {
        req.checkBody('firstname', 'firstname is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('lastname', 'lastname is required').notEmpty();
        req.checkBody('kay', 'kay is required').notEmpty();
        await req.asyncValidationErrors();
        let email = await VaEmail.GetVerificatedEmailByKayAndDelete(req.body.kay);
        let user_new = {
            username: req.body.firstname + req.body.lastname,
            firstName: req.body.firstname,
            lastName:  req.body.lastname,
            email: email.email,
            password:  req.body.password
        }
        if(await User.InsertUser(user_new)){
            res.json({
                scsess: true,
                message: 'User added'
            });
        } else {
            res.json({
                scsess: false,
                message: 'User exist'
            });
        }
    } catch (error) {
        return next(error);
    }
});

module.exports = router;

async function checkAuthentication(req,res,next){
    try {
        let user = await User.IsSignin(req.headers.authorization);
        req.IsUserSignin = true;
        req.user = await (new User(user)).GetUser();
       
        next();
    } catch (error) {
        req.user = null;
        req.IsUserSignin = false;
        next();
    }
}
function MustBeSignin(req,res,next){
    if(req.IsUserSignin){
        next();
    } else {
        next(new Error('you must signin'));
    } 
}
function NotMustBeSignin(req,res,next){
    if(!req.IsUserSignin){
        next();
    } else {
        next(new Error('you are signin'));
    } 
}