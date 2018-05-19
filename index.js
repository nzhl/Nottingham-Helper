const request = require('request');
const cheerio = require('cheerio');
const HashMap = require('hashmap');
const fs = require('fs');

const NUM_OF_REQUESTS = 25;
const WAITTING_TIME = 5000; 

let map = new HashMap();


/* queue API */ 

let cookieJar = request.jar();
let requestQueue = [];
let currentOn = 0;
let currentFinish = 0;
let totalFinish = 0;

function cleanQueue(){
  while(currentOn < NUM_OF_REQUESTS && requestQueue.length != 0){
    let request = requestQueue.pop();
    if(map.has(request.url)){
      continue;
    } else{
      map.set(request.url, true);
      get(request.url, request.callback, request.callParams);
      currentOn++;
    }
  }
}


function get(url, callback, callParams={}) {
  let buffer = [];
  request({
    url: url,
    method: 'GET',
    jar: cookieJar,
    followAllRedirects: true,
  }).on('response', (response) => {
    if(response.headers["content-type"] != 'application/pdf' &&
      (url.endsWith('.pdf') || callParams.isPDF)){
      console.log('PDF request with NON-PDF response' + totalFinish + ':\r\n\t', url)
    }else if(response.headers["content-type"] == 'application/pdf'){
      callParams.isPDF = true;
    }else{
      // console.log('NON-PDF response' + currentFinish + ':\r\n\t', url)
    }
  }).on('data', (buf) => {
    buffer.push(buf);
  }).on('end', () => {
    currentFinish++;
    totalFinish++;
    if(currentFinish == NUM_OF_REQUESTS){
      console.log('alerady', totalFinish);
      console.log('alerady', totalFinish);
      setTimeout(login, WAITTING_TIME);
    }
    if(callParams.isPDF){
      callParams.buffer = Buffer.concat(buffer);
    } else{
      callParams.buffer = Buffer.concat(buffer).toString();
    }
    callback(callParams);
  }).on('error', (error) => {
    console.log(error);
  })
}


function login(callback=() => {currentFinish = 0; currentOn = 0; cleanQueue();}){
  let callParams = {};
  let buffer = [];
  request({
    url: 'https://moodle.nottingham.ac.uk/login/index.php',
    method: 'post',
    form: {
      username: 'psyzz2',
      password: 'NOTT0464826945'
    },
    jar: cookieJar,
    followAllRedirects: true
  }).on('data', (buf) => {
    buffer.push(buf);
  }).on('end', () => {
    callParams.buffer = Buffer.concat(buffer).toString();
    callback(callParams);
  });
}


function parseIndex(callParams) {
  let buffer = callParams.buffer;
  let $ = cheerio.load(buffer);
  let eles = $('.nottingham-tabcontent a[href*="course"]');
  for (let i = 0; i < eles.length; ++i) {
    let courseUrl = eles[i].attribs.href;
    requestQueue.push({
      url: courseUrl,
      callback: parseCourse
    });
  }
  cleanQueue();
}

function parseCourse(callParams) {
  function validfyFileName(str) {
    return str.replace(/:/g, '')
      .replace(/\//g, "").replace(/\./g, 'point').replace(/\?/g, '').trim();
  }
  let buffer = callParams.buffer;
  let $ = cheerio.load(buffer);
  let elems = $('a[href$=".pdf"], a[href*="resource/view"]');
  let dirName = "gg/" + $('#course-header h1').html();
  try{
    fs.accessSync(dirName,fs.F_OK);
  }catch(e){
    fs.mkdirSync(dirName);
  }
  for(let i=0; i<elems.length; ++i){
    let pdfName = dirName + '/' + validfyFileName(cheerio.load(elems[i]).text()) + '.pdf';
    let pdfUrl = elems[i].attribs.href;
    requestQueue.push({
      url: pdfUrl,
      callback: savePDF,
      callParams: {pdfName: pdfName}
    });
  };
  cleanQueue();
}

function savePDF(callParams){
  let buffer = callParams.buffer;
  let pdfName = callParams.pdfName;
  if(callParams.isPDF){
    fs.createWriteStream(pdfName).write(buffer);
  }else{
    let $ = cheerio.load(buffer);
    let pdfUrl = $('a[href$=".pdf"]').attr('href');
    if(!pdfUrl){
      // maybe word file or others...
      console.log('NON-PDF html saved...\r\n\t', pdfName);
      fs.createWriteStream(pdfName + '.html').write(buffer);
      return;
    }
    requestQueue.push({
      url: pdfUrl,
      callback: savePDF,
      callParams: {pdfName: pdfName, isPDF: true}
    })
  }
}


login(parseIndex);
