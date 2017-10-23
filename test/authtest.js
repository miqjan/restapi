//import mocha from 'mocha';
require('babel-core/register')({
  ignore: /node_modules\/(?!ProjectB)/
});
let chai = require('chai');
chai.config.includeStack = true;
chai.config.showDiff = true;
let chaiHttp =require('chai-http');
let server =require( '../server');
let should = chai.should();
let assert = chai.assert;
let VaEmail = require('../models/VerificationEmailsModel').default;
import User from '../models/UserModel';
import mlog from 'mocha-logger';

chai.use(chaiHttp);

describe('Test api all',  () => {
    after(async ()=>{
        console.log(await User.query().delete().where(true));
    });
    let scsess = null;
    describe('Test send verification mail', () => {
        it('It should not send verification mail. Valid email', (done) => {
            chai.request(server)
            .post('/auth/sendemail')
            .send({
                email: 'jknkllkmjk'
            })
            .end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('error')
                mlog.error(res.body.error);
                done();
            });
        });
        it('It should send verification mail', (done) => {
            chai.request(server)
            .post('/auth/sendemail')
            .send({
                email: 'temp@temp.temp'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('key');
                res.body.should.have.property('mail');
                res.body.mail.should.have.property('accepted');
                res.body.mail.accepted.should.be.a('array');
                scsess = res.body.key;
                mlog.success(scsess);
                done();
            });
        });
    });
    describe('Test verificat the email', () => {
        it('It should not verificat the email. Incorect key', (done) => {
            chai.request(server)
            .get('/auth/verifemail/'+scsess+'45')
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                mlog.error(res.body.error);
                done();
            });
        });
        it('It should verificat the email', (done) => {
            chai.request(server)
            .get('/auth/verifemail/'+scsess)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('verificated');
                res.body.should.have.property('key');
                res.body.should.have.property('message');
                res.body.verificated.should.be.true;
                //scsess = res.body.key;
                mlog.success(res.body.message);
                done();
            });
        });
        it('It should verificat the email again', (done) => {
            chai.request(server)
            .get('/auth/verifemail/'+scsess)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('verificated');
                res.body.should.have.property('key');
                res.body.should.have.property('message');
                res.body.verificated.should.be.true;
                scsess = res.body.key;
                mlog.pending(res.body.message);
                done();
            });
        });
    });
    describe('Test add user', () => {
        it('It should add user', (done) => {
            chai.request(server)
            .post('/auth/signupcallback')
            .send({
                firstname: 'firstname',
                lastname: 'lastname',
                password: 'password',
                kay: scsess
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('scsess');
                res.body.should.have.property('message');
                res.body.scsess.should.be.true;
                done();
            });
        });
        
    });
    describe('Test signin', () => {
        it('It should not sign in incorect email', (done) => {
            chai.request(server)
            .post('/auth/signin')
            .send({
                email: 'temp@temp.',//error email
                password: 'password'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                mlog.error(res.body.error);
                done();
            });
        });
        it('It should not sign in incorect password', (done) => {
            chai.request(server)
            .post('/auth/signin')
            .send({
                email: 'temp@temp.temp',
                password: 'passwo'//error password
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                mlog.error(res.body.error);
                done();
            });
        });
        it('It should sign in', (done) => {
            chai.request(server)
            .post('/auth/signin')
            .send({
                email: 'temp@temp.temp',
                password: 'password'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                res.body.should.have.property('email');
                res.body.email.should.to.be.equal('temp@temp.temp');
                scsess = res.body.token;
                done();
            });
        });
    });
    describe('Other tests', () => {
        it('It should get user', (done) => {
            chai.request(server)
            .get('/auth/user')
            .set('Authorization', scsess)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                res.body.should.have.property('email');
                res.body.email.should.to.be.equal('temp@temp.temp');
                scsess = res.body.token;
                done();
            });
        });
        it('It should not send mail. Email already exist', (done) => {
            chai.request(server)
            .post('/auth/sendemail')
            .send({
                email: 'temp@temp.temp'
            })
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                mlog.error(res.body.error);
                done();
            });
        });
    });
    
    
    
    
    
});

/*
chai.request(server)
.get('/api/car/' + data.car_id)
.headers({'some_custom_attribute':'some_value'})
.end(function(err, res) {
  //do something
});
*/