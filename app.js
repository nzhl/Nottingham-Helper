const leetcode = require('./leetcode')
const express = require('express')
const app = express()


app.get('/problems', function (req, res) {
  leetcode.requestProblems()
  .then((problems)=> {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(problems));
  }).catch((reason) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({error: "Unknown error!"});
  })
})

const https = require('https')
const fs = require('fs')

var options = {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./public.csr')
};

https.createServer(options, app).listen(8888, function () {
    console.log('Https server listening on port ' + 8888 );
});
