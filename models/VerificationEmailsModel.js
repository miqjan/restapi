import {Model} from 'objection';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pidCrypt from 'pidcrypt/';
import urlencode from 'urlencode';
import 'pidcrypt/aes_cbc';

export default class ValidationEmail extends Model {
    constructor(){
        super();
    }
    // Table name is the only required property.
    static tableName = 'email_for_verification';
    static modelPaths = [__dirname];
    static transporter = nodemailer.createTransport({service: "Yandex",auth: {
            user: "miqjan@yandex.com",  // to be replaced by actual username and password
            pass: "55855771jasojan"
        }
    });

    static jsonSchema = {
        type: 'object',
        //required: ['email'],
        properties: {
            id: {type: 'integer'},
            email: {type: 'string', minLength: 1, maxLength: 255},
            createdAt: {type:'date'},
            user_agent: {type: 'text'},
            verificated: {type: 'integer'}
        }
    };

    static async SendMail(email){
        try {
            let inserted = await ValidationEmail.query().insert({email:email});
            let temp = urlencode((new pidCrypt.AES.CBC()).encryptText(inserted.email + '==' + ((+inserted.id)^51036), 55261));
            //temp = temp.replace(/\//g, "&");
            let message = {
                from: 'Sender Name <miqjan@yandex.com>',
                to: `Recipient <${email}>`,
                subject: 'Verification Email ✔',
                //text: `http://localhost:3000/verif/email/${temp}`,
                html: `<a href='http://localhost:3000/verif/email/${temp}'>Url of verification :</a>
                <p>http://localhost:3000/verif/email/${temp} work time 24 hour</p>`
            };
            return{
                mail: await ValidationEmail.transporter.sendMail(message),
                key: temp
            };
        } catch (error) {
            throw error;
            return false;
        }
        
    }
    static async EmailVerificate(kay){
        try {
            let temp = urlencode.decode((new pidCrypt.AES.CBC()).decryptText(kay, 55261));//.replace(/&/g,'\/')
            let id = (+temp.slice(temp.lastIndexOf('==')+2))^51036;
            let email = temp.slice(0,temp.lastIndexOf('=='));
            let row = await ValidationEmail.query().findById(id);
            
            if(row && (Object.keys(row).length > 0)  && (row.email === email)){
                if(row.verificated === null){
                    let temp = await ValidationEmail.query().updateAndFetchById(id, {verificated: 1});
                    return {
                        verificated: true,
                        key: urlencode((new pidCrypt.AES.CBC()).encryptText(temp.id+'=='+temp.email,'password')),
                        message : 'Verification scsses'
                    };
                } else {
                    return {
                        verificated: true,
                        key: urlencode((new pidCrypt.AES.CBC()).encryptText(row.id+'=='+row.email,'password')),
                        message : 'The email verification was used. This email was verificated scsess '+row.email
                    };
                }
            } else {
                throw new Error('Kay is incorrect');
            }
        } catch (error) {
            throw error;
            return false;
        }
        
    }
    static async GetVerificatedEmailByKayAndDelete(kay){
        try {
            let temp = (new pidCrypt.AES.CBC()).decryptText(urlencode.decode(kay), 'password');
            let email = temp.slice(temp.lastIndexOf('==')+2);
            let id = +temp.slice(0,temp.lastIndexOf('=='));
            let row = await ValidationEmail.query().findById(id);
            if(row && (Object.keys(row).length > 0)  && (row.email === email) && (row.verificated == 1)){
                await ValidationEmail.query().deleteById(row.id);
                return row;
            } else {
                throw new Error('Kay is incorrect');
            }
        } catch (error) {
            throw error;
            return false;
        }
        
    }
 
  }