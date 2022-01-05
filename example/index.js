const cookieSession = require('cookie-session');
const express = require('express');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const twitterOAuth2 = require('../lib/index.js').TwitterOAuth2;

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: [crypto.randomBytes(32).toString('hex')]
}))

app.use(cookieParser())

app.use(twitterOAuth2({}))

app.get('/', (req, res, next) => {
  console.log('received tokens %j', req.session.tokenSet);
  res.send('Hello World!');
});

const server = app.listen(3000, () => {
  console.log('Node.js is listening to PORT: ' + server.address().port);
});