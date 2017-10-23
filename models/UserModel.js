import {Model} from 'objection';
import jwt from 'jsonwebtoken';
import request from 'request-promise';

export default class User extends Model {
    // Table name is the only required property.
    constructor(user_and_token){
        super();
        if(user_and_token){
          	this.user = user_and_token.user;
          	this.user.token  = user_and_token.token;
        }
    }
    
    static tableName = 'Users';
    static modelPaths = [__dirname];
    
    // Optional JSON schema. This is not the database schema! Nothing is generated
    // based on this. This is only used for validation. Whenever a model instance
    // is created it is checked against this schema. http://json-schema.org/.
    static jsonSchema = {
        type: 'object',
        required: ['email', 'username'],
    
        properties: {
            id: {type: 'integer'},
            username: {type: 'string', minLength: 1, maxLength: 255},
            firstName: {type: 'string', minLength: 1, maxLength: 255},
            lastName: {type: 'string', minLength: 1, maxLength: 255},
            email: {type: 'string', minLength: 1, maxLength: 255},
            password: {type: 'string', minLength: 1, maxLength: 255},
            profilid: {type: 'string', minLength: 1, maxLength: 255},
            age: {type: 'integer'},
            address: {type:'json'},
            createdAt: {type:'date'},
        }
    };
    static async Signin(email,password){
        try{
            let isexist = await User.IsEmailExist(email);
            if(isexist){
                if(password === isexist.password)
                {
                    let token = jwt.sign({id: isexist.id,email: isexist.email},'password')
                    return {user:isexist,token:token};
                } else {
                    let err = new Error('Invalid password');
                    err.status = 400;
                    throw err;
                }
            } else {
                let err = new Error('Invalid email');
                err.status = 400;
                throw err;
            }
          
        }catch(err){
            throw err;
            return false;
        }
    }
    static async IsSignin(token){
        try {
            let decoded = jwt.verify(token, 'password');
            let user = await User.query().findById(decoded.id);
            if((Object.keys(user)).length > 0){
                return {user : user, token : token};
            } else {
                throw new Error('Incorect token');
            }
        } catch(err) {
            throw err;
            return false;
        }
    }
    static async IsEmailExist(email){
        try{
            let row = await User.query().findOne({email:email});
            return row? row : false;
        }catch(err){
            throw err;
            return false;
        }
    }
    static async InsertUser(object){
        try{
           
            if(!(await User.IsEmailExist(object.email))){
                return await User.query().insert(object);
            } else {
                return false;
            }
        }catch(err){
            throw err;
            return false;
        }
    }
    static async SignInFacebookUser(object){
        try{
            let local_user = await User.query().findOne({profilid:object.profilid});
            let token = '';
            if(local_user){
                token = jwt.sign({id: local_user.id,email: local_user.email},'password');
            } else {
                local_user = await User.query().insert(object);
                token = jwt.sign({id: local_user.id,email: local_user.email},'password');
            }
            return {user:local_user,token:token};
        }catch(err){
            throw err;
            return false;
        }
    }
    static async GetUserByFacebookSuccessToken(successtoken){
        try {
            let facebook_user = await request(`https://graph.facebook.com/v2.10/me?access_token=${successtoken}&fields=name,last_name,first_name,name_format,short_name,email,id`);
            facebook_user = JSON.parse(facebook_user);
            return {
                username : facebook_user.name,
                email: facebook_user.email,
                firstname: facebook_user.first_name,
                lastname: facebook_user.last_name,
                profilid: facebook_user.id
            };
        } catch (error) {
            throw error;
            return false;
        }
    }
   
    async GetUser(){
        delete this.user.password
        return this.user;
    }
    /*

     static async signinfacebook(accessTokenfacebook){
        try {
            let user = await User.GetUserByFacebookSuccessToken(accessTokenfacebook);

        } catch (error) {
            
        }
        
            //console.log(this.ToUserObject());
            usermodel.insertUserfacebook(this.ToUserObject(),(err,isset,user)=>{
                if(err){
                    cb(err,false,null);
                    return;
                }
                
                this.id = user.id;
                this.success_token = jwt.sign({id: this.id,email: this.email},'password');
                //console.log(user,this.success_token);
                cb(null,true,{'message':'signin success ', 'success_token' : `${this.success_token}`});
            });
        });
       
    }



    // This object defines the relations to other models.
    static relationMappings = {
      owner: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one. We use the file path version
        // here to prevent require loops.
        modelClass: `${__dirname}/Person`,
        join: {
          from: 'Animal.ownerId',
          to: 'Person.id'
        }
      }
    };
    */
  }