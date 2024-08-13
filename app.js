require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride=require('method-override')
const connectDB=require('./server/config/db')
const session=require('express-session');
const passport=require('passport');
const MongoStore=require('connect-mongo');

const app = express();

const port = process.env.PORT || 5000;
app.use(session({   
    secret: 'keyboard at',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    cookie:{
        maxAge:new Date (Date.now() +(3600000))
    }
}));
app.use(passport.initialize());
app.use(passport.session());


 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"))


//connect to database
connectDB(); 

app.use(express.static('public'));

app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


//routes
app.use('/',require('./server/routes/auth'));
app.use('/',require('./server/routes/index'));
app.use('/',require('./server/routes/dashboard'));



// handle404 error

app.get('*',function(req,res){
    res.status(404).send('404 page not found');
})



app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
