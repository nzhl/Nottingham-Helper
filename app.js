const HTTPS = true


const path = require('path')
const leetcode = require('./leetcode')
const express = require('express')
const app = express()


app.get('/problems', function (req, res) {
  leetcode.requestProblems()
  .then(problems => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(problems))
  }).catch(reason => {
    res.setHeader('Content-Type', 'application/json')
    res.send({error: "Unknown error !"})
  })
})

app.get('/problem', function (req, res) {
  if (req.query.name) {
    leetcode.requestProblem(req.query.name)
    .then(problem => {
    res.setHeader('Content-Type', 'application/json')
      res.send({content: problem});
    })
  } else {
    res.setHeader('Content-Type', 'application/json')
     res.send({error: "Problem name is required !" })
  }
})

app.get('/rank/:org', function (req, res) {
  res.sendFile(path.resolve(__dirname, `data/${req.params.org}.json`))
})


if (HTTPS) {
  const https = require('https')
  const fs = require('fs')

  var options = {
      key: fs.readFileSync('./private.key'),
      cert: fs.readFileSync('./public.csr')
  };

  https.createServer(options, app).listen(8888, function () {
      console.log('Https server listening on port ' + 8888 )
  });
}
else {
  app.listen(80)
}
