const express = require('express');
const url = require('url');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 5000;

const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

  app.get('/room', async (req, res) => {
    try {
      const queryObject = url.parse(req.url,true).query;
      const client = await pool.connect();

      queryString = 'SELECT * FROM rooms WHERE';
      if (queryObject.city != undefined){
        var city = queryObject.city;
        city = city.charAt(0).toUpperCase() + city.substr(1).toLowerCase()
        try{
          queryString += ' id IN ' + "(SELECT id FROM hotels WHERE city = '" + city + "')";
        } catch(err){
          console.error(err);
          res.send("");
        }
      }else if (queryObject.id != undefined){
        queryString += ' id=' + queryObject.id;
      }
      if(queryObject.date != undefined){
        queryString += " AND (leavedate<TO_DATE('" + queryObject.date + "', 'YYYY-MM-DD') OR taken=false)";
      }else if(queryObject.id == undefined){
        queryString += ' AND taken=false';
      }
      if(queryObject.adult != undefined){
        queryString += ' AND adultnumber>=' + queryObject.adult;
      }
      if(queryObject.child != undefined){
        queryString += ' AND childnumber>=' + queryObject.child;
      }

      const result = await client.query(queryString);
      const results = { 'results': (result) ? result.rows : null};
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  app.get('/hotel', async (req, res) => {
    try {
      const queryObject = url.parse(req.url,true).query;
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM hotels WHERE id=' + queryObject.id);
      const results = { 'results': (result) ? result.rows : null};
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  // NOT FINISHED
  //
  //
  // app.get('/', async (req, res) => {
  //   try{
  //     var transporter = nodemailer.createTransport({
  //       service: 'REDACTED',
  //       secure: false,
  //       auth: {
  //         user: 'REDACTED',
  //         pass: 'REDACTED'
  //       }
  //     });
      
  //     var mailOptions = {
  //       from: 'REDACTED',
  //       to: 'REDACTED',
  //       subject: 'REDACTED',
  //       text: 'REDACTED'
  //     };
      
  //     transporter.sendMail(mailOptions, function(error, info){
  //       if (error) {
  //         console.log(error);
  //       } else {
  //         console.log('Email sent: ' + info.response);
  //       }
  //     }); 
  //   } catch (err){
  //     res.send("Error: " + err);
  //   }
  //   res.send("Email send.");
  // })

app.listen(PORT);