const HTTPS = true

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
  let form = new formidable.IncomingForm();
  form.parse(req, function(error, fields, files) {
    const directory = fields.productId
    const fileName = fields.fileName
    if (!fsExistsSync(path.resolve(__dirname, 'public', directory))) {
      fs.mkdirSync(path.resolve(__dirname, 'public', directory))
      console.log('创建')
    }
    else console.log('no')
    fs.writeFileSync(
      path.resolve(__dirname, 'public', directory, fileName), 
      fs.readFileSync(files.file.path)
    );
    res.send(200)
  })
})

function fsExistsSync(path) {
  try{
    fs.accessSync(path,fs.F_OK);
  }catch(e){
    return false;
  }
  return true;
}



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

