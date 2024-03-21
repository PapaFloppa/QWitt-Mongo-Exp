const express = require('express');
const bodyParser=require('body-parser');
var cookieParser = require('cookie-parser')
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;
const uri = "mongodb+srv://user:mypassword@qwittmongodb.6txkswx.mongodb.net/?retryWrites=true&w=majority&appName=QWittMongoDB";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log('Server started at http://localhost:' + port);
var fs = require("fs");
app.listen(port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

////This is the default pathway to see whether you want to log in or register////
app.get('/', function(req, res) {
  var outstring = 'Click a link to get started: '
  outstring += '<p><a href=\"./register\">Register</a>';
  outstring += '<p><a href=\"./login\">Login</a>';
  outstring += '<p><a href=\"/View/Cookies\">View Cookies</a>';
  res.send(outstring);
});

////register HTML this reads from a local html file////
app.get('/register', function(req, res, next){
    fs.readFile('register.html','utf8',(err,data)=>{
        if(err){
          res.send('some err occured ',err);
        }
        res.send(data);
      })
  });

////login HTML this reads from a local html file////
app.get('/login', function(req, res, next){
  fs.readFile('login.html','utf8',(err,data)=>{
      if(err){
        res.send('some err occured ',err);
      }
      res.send(data);
    })
});

////This is the login, it will read if you choose the login link and enter your credentials////
app.get('/api/mongoread/:inpkey&:inpval', function(req, res) {
  // access as ...app.github.dev/api/mongo/username&password    
  const client = new MongoClient(uri);
  
  async function run() {
    try {
      const database = client.db('Qwitt_DB_Example');
      const where2look = database.collection('login_info');
      const query = {};
      query[req.params.inpkey]= req.params.inpval;
      const part = await where2look.findOne(query);
      //if no user found//
        if (part === null) {
          var outstring = '<br>There was no user found with the specified credentials.</br>'
          outstring += "<br>Would you like to start from the begining or register for an account?</br>"
          outstring += '<p><a href=\"/register\">Register</a>';
          outstring += '<p><a href=\"/\">Start over</a>';
          outstring += '<p><a href=\"/View/Cookies\">View Cookies</a>';
          res.send(outstring);
        //otherwise there is a user and set a cookie//
      } else { 
          req.params.inpval += Date.now();
          res.cookie(req.params.inpkey + "'s cookie", req.params.inpval,{maxAge : 60000});
          var outstring = '<br>cookies set</br>';
          outstring += ('Found this: ' + JSON.stringify(part));
          outstring += '<br>Would you like to view all active cookies or start over?</br>'
          outstring += '<p><a href=\"/View/Cookies\">View Cookies</a>';
          outstring += '<p><a href=\"/\">Start over</a>';
          res.send(outstring); // Send not found message
      }
  
    }finally{
      await client.close();
    }
  }
  run().catch(console.dir);
});

////This is the register, it will read if you choose the login link and enter your credentials////
app.post('/api/mongowrite/:inpkey&:inpval', function(req, res) {
  const client = new MongoClient(uri);
  const doc2insert = {};
  doc2insert[req.params.inpkey]=req.params.inpval;
  async function run() {
    try {
      const database = client.db('Qwitt_DB_Example');
      const where2put = database.collection('login_info');
  
      const doit = await where2put.insertOne(doc2insert);
      res.send('Got this: ' + JSON.stringify(doit));
  
    }finally{
      req.params.inpval += Date.now();
      res.cookie(req.params.inpkey + "'s cookie", req.params.inpval,{maxAge : 120000});
      var outstring = ('<br>cookies set</br>');
      outstring += ('User Found: ' + JSON.stringify(part));
      outstring += '<br>Would you like to view all active cookies or start over?</br>'
      outstring += '<p><a href=\"/View/Cookies\">View Cookies</a>';
      outstring += '<p><a href=\"/\">Start over</a>';
      res.send(outstring);
      await client.close();
    }
  }
  run().catch(console.dir);
});

////Prints all cookie values to the screen////
app.get('/View/Cookies', function (req, res) {
  mycookies=req.cookies;
  var outstring = '<br>'+ JSON.stringify(mycookies) +'</br>'
  outstring += '<br>Would you like to start over or clear the cookies?</br>';
  outstring += '<p><a href=\"/\">Start over</a></p>';
  outstring += '<p><a href=\"/Clear/Cookies\">Clear Cookies</a></p>';
  res.send(outstring);
});
    
////Clears all the cookies////
app.get('/Clear/Cookies', function (req, res) {
  const cookies = req.cookies;
    Object.keys(cookies).forEach(cookieName => {
        res.clearCookie(cookieName);
    });
    var outstring = '<br>Would you like to start over or view the empty cookies just to make sure?</br>';
    outstring += '<p><a href=\"/\">Start over</a></p>';
    outstring += '<p><a href=\"/View/Cookies\">View Cookies</a></p>';
    res.send(outstring);
});