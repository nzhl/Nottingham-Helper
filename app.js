const HTTPS = false

const path = require('path')
const fs = require('fs')
const rp = require('request-promise-native');
const mongoose = require('mongoose')
const express = require('express')
const formidable = require('formidable')
const bodyParser = require('body-parser');
const app = express()


function fsExistsSync(path) {
  try{
    fs.accessSync(path,fs.F_OK);
  }catch(e){
    return false;
  }
  return true;
}

mongoose.connect('mongodb://localhost:27017/secondhand', useNewUrlParser=true)
const itemSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  location: String,
  time: String,
  price: String,
  seller: String,
  images: Array
});

const ItemModel = mongoose.model('item', itemSchema);


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

app.get('/openid', function (req, res) {
  const JSCODE = req.query.jscode;
  const APPID = 'wxa3a39ce72b48c8ea';
  const SECRET = 'f80ccc411105cc9949d6e968190ab360';
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${JSCODE}&grant_type=authorization_code`
  rp({
    url: url,
    json: true
  }).then(function(json) {
    res.send(json)
  })
})

app.post('/upload', function (req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(error, fields, files) {
    const directory = fields.productId
    const fileName = fields.fileName
    if (!fsExistsSync(path.resolve(__dirname, 'public', directory))) {
      fs.mkdirSync(path.resolve(__dirname, 'public', directory))
    }
    fs.writeFileSync(
      path.resolve(__dirname, 'public', directory, fileName), 
      fs.readFileSync(files.file.path)
    );
    res.send(200)
  })
})

app.post('/item', function (res, req) {
  let body = res.body;
  console.log(res.body)
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

