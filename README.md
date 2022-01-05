# :baby_chick: twitter-oauth2
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Express.js middleware implementation for Twitter OAuth2 Client.

## Install
TBD

## Usage
TBD
```js
const twitterOAuth2 = require('twitter-oauth2').TwitterOAuth2;
const cookieSession = require('cookie-session');
const express = require('express');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

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
```

## License

[MIT](LICENSE)