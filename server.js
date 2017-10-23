import express from 'express';
import bodyParser from 'body-parser';
import Authrouter  from './routes/auth';
import Knex from 'knex';
import knexConfig from './config/knexfile';
import {Model} from 'objection';


let app = express();

console.log('NODE_ENV = '+process.env.NODE_ENV);
//const KNEX = Knex(knexConfig[process.env.NODE_ENV]);
const KNEX = Knex(knexConfig[process.env.NODE_ENV]);

Model.knex(KNEX);
app.set('port', process.env.PORT || 5000);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', Authrouter);




app.use(function(req, res, next){
    res.status(404);
    res.send({ error: 'Not found' });
    return;
});
app.use(function(err, req, res, next){
    if (err instanceof Array){
        err.status = 422;
    } 
    res.status(err.status || 500);
    res.json({ error: err.message || err[0].msg});
    return;
});

let listener = app.listen(app.get('port'),'localhost',function(){
    //console.log('App listening at http://%s:%s', listener.address().address, listener.address().port);
});

module.exports = listener;