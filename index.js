require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const urlMappings = [];
function generateUniqueShortCode() {
  if (urlMappings.length === 0) {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }
  let shortCode;
  do {
    shortCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  } while (urlMappings.some(obj => obj.short === shortCode));
  return shortCode;
}
const storeURI = (url, shortUrl) => {
  return {
    original_url: url,
    short_url: parseInt(shortUrl, 10)
  }
}
app.post('/api/shorturl',(req,res)=>{
  const originalURL=req.body.url;
  const validUrlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;
  if (validUrlRegex.test(originalURL)) {
    const object = storeURI(originalURL, generateUniqueShortCode())
    urlMappings.push(object);
    res.json(object);
  }
  res.json({error:"invalid url"})
})
app.get('/api/shorturl/:input', (req,res)=>{
  const short_code = parseInt(req.params.input);
  const redirectURI = urlMappings.find(obj=> obj.short_url === short_code)?.original_url;
  res.redirect(302, redirectURI);
})
