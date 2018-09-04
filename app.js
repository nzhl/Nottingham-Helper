const HTTPS = true

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

mongoose.connect('mongodb://localhost:27017/secondhand', 
  { useNewUrlParser: true}
);

const itemSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  location: String,
  time: String,
  price: String,
  seller: String,
  images: Array,
  category: String,
  username: String,
  avatar: String
});

const ItemModel = mongoose.model('item', itemSchema);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(__dirname + '/public'));



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

app.post('/image', function (req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(error, fields, files) {
    const directory = fields.id
    const fileName = fields.name
    if (!fsExistsSync(path.resolve(__dirname, 'public', directory))) {
      fs.mkdirSync(path.resolve(__dirname, 'public', directory))
    }
    fs.writeFileSync(
      path.resolve(__dirname, 'public', directory, fileName), 
      fs.readFileSync(files.file.path)
    );
    res.sendStatus(200)
  })
})

app.post('/item', function (res, req) {
  const body = res.body;
  const item = new ItemModel(body);
  item.save((error, result) => {
    if (error) {
      console.error(error)
      req.sendStatus(400)
    } else {
      req.sendStatus(200)
    }
  })
})

app.delete('/item', function (res, req) {
  const id = res.query.id;
  ItemModel.findOne({id: id}, (error, result) => {
    if (error) {
      console.error(error)
      req.sendStatus(400)
    } else {
      const directory = path.resolve(__dirname, 'public', id)
      // delete related images
      for(name of result.images){
        fs.unlinkSync(path.resolve(directory, name))
      }
      
      // avatar image may not exist for unknown reason
      try {
        fs.unlinkSync(path.resolve(directory, result.avatar))
      } catch (error) {
        console.error(error)
      }
      fs.rmdirSync(directory)

      ItemModel.deleteOne({id: id}, (error, result) => {
        if (error) {
          console.error(error)
          req.sendStatus(400)
        } else {
          req.sendStatus(200)
        }
      })
    }
  })
})

app.put('/item', function (res, req) {
  const body = res.body;
  const id = res.body.id;
  ItemModel.updateOne({id: id}, body, (error, result) => {
    if (error) {
      console.error(error)
      req.sendStatus(400)
    } else {
      req.sendStatus(200)
    }
  })
})

app.get('/item', function (res, req) {
  const id = res.query.id;
  ItemModel.findOne({id: id}, (error, result) => {
    if (error) {
      console.error(error)
      req.sendStatus(400)
    } else {
      req.json(result)
    }
  })
})

app.get('/items', function (res, req) {
  const seller = res.query.seller;
  let condition = {};
  if (seller) {
    condition = {seller: seller};
  }

  ItemModel.find(condition, (error, result) => {
    if (error) {
      console.error(error)
      req.sendStatus(400)
    } else {
      req.json(result)
    }
  }).sort({'_id': -1})
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

