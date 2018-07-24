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

app.listen(8888)
