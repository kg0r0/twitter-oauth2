# :baby_chick: twitter-oauth2
[![Npm package version](https://badgen.net/npm/v/twitter-oauth2)](https://badge.fury.io/js/twitter-oauth2)
[![Build](https://github.com/kg0r0/twitter-oauth2/actions/workflows/main.yml/badge.svg)](https://github.com/kg0r0/twitter-oauth2/actions/workflows/main.yml)
[![Publish](https://github.com/kg0r0/twitter-oauth2/actions/workflows/npm.yml/badge.svg)](https://github.com/kg0r0/twitter-oauth2/actions/workflows/npm.yml)
[![CodeQL](https://github.com/kg0r0/twitter-oauth2/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/kg0r0/twitter-oauth2/actions/workflows/codeql-analysis.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Express.js middleware implementation for Twitter OAuth 2.0 Client.
This module supports [OAuth2.0 Authorization Code Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1) with [PKCE](https://datatracker.ietf.org/doc/html/rfc7636).
Please see the [Twitter OAuth2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code) for more information.


## Install
```bash
$ npm i twitter-oauth2
```

## Usage
```js
import express from 'express';
import session from 'express-session';
import { twitterOAuth2 } from 'twitter-oauth2';
const app: express.Express = express();

app.use(session({
  name: 'YOUR-SESSION-NAME',
  secret: 'YOUR-SECRET',
  cookie: {
    sameSite: 'lax'
  },
  resave: false,
  saveUninitialized: true
}))

app.use(twitterOAuth2({}))

app.get('/', async (req: express.Request, res: express.Response) => {
  const tokenSet = req.session.tokenSet;
  console.log('received tokens %j', req.session.tokenSet);
  const { data } = await axios.get('https://api.twitter.com/2/users/me', 
  { 
    headers: {
      Authorization: `Bearer ${tokenSet?.access_token}`
    }
  });
  res.send(`Hello ${data.data.username}!`);
})
```
**Note** This module implement a session store that is compatible with [express-session](https://www.npmjs.com/package/express-session).
See the [example](https://github.com/kg0r0/twitter-oauth2/tree/main/example) for basic usage.

### twitterOAuth2(options)

Create a middleware with the given `options`.

#### Options
`twitterOAuth2` accepts these properties in the options object.

##### client_id

The client identifier.
Can be found in the keys and tokens section of the developer portal under the header "Client ID." If you don't see this, please get in touch with our team directly. The Client ID will be needed to generate the authorize URL.
This option can also be read from environment variable `CLIENT_ID`.

##### client_secret

The client secret.
If you have selected an App type that is a confidential client you will be provided with a “Client Secret” under “Client ID” in your App’s keys and tokens section.
This option can also be read from environment variable `CLIENT_SECRET`.

##### redirect_uri 

Your callback URL. You will need to have exact match validation.
This option can also be read from environment variable `REDIRECT_URI`.

##### scope 

The scope of the access request.
Scopes allow you to set granular access for your App so that your App only has the permissions that it needs. 
See the [Twitter OAuth2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code) for available scopes.
The current default is `tweet.read users.read offline.access`.

##### type_of_app
The [client type](https://datatracker.ietf.org/doc/html/rfc6749#section-2.1) defined in OAuth2.0.
This value was set during the registration process.
The current default is `confidential`.

#### Error Handling
Errors raised by this middleware are handled by [the default Express error handler](https://expressjs.com/en/guide/error-handling.html#the-default-error-handler). 
To write your own error handler, see the Express documentation on writing [Custom error handlers](https://expressjs.com/en/guide/error-handling.html#writing-error-handlers).

## Contributing
Thanks for your feedback and contribution to this repo!
Please feel free to open issues and send pull-requests.

## License

[MIT](LICENSE)
