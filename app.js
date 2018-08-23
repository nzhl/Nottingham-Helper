const HTTPS = false

const path = require('path')
const fs = require('fs')
const leetcode = require('./leetcode')
const express = require('express')
const formidable = require('formidable')
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


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

app.post('/upload', function (req, res) {
  console.log(req.body)
  let form = new formidable.IncomingForm();
  form.parse(req, function(error, fields, files) {
    console.log(Object.keys(files))
    console.log(fields)
    // fs.writeFileSync("public/test.png", fs.readFileSync(files.upload.path));
    res.send(200)
  })
})



if (HTTPS) {
  const https = require('https')
  const fs = require('fs')

  var options = {
      key: fs.readFileSync('./private.key'),
      cert: fs.readFileSync('./public.csr')
  };

  https.createServer(options, app).listen(443, function () {
      console.log('Https server listening on port ' + 443 )
  });
}
else {
  app.listen(80)
}

