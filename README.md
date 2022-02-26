# twitter-oauth2
[![Npm package version](https://badgen.net/npm/v/twitter-oauth2)](https://badge.fury.io/js/twitter-oauth2)
[![CI](https://github.com/kg0r0/twitter-oauth2/actions/workflows/ci.yml/badge.svg)](https://github.com/kg0r0/twitter-oauth2/actions/workflows/ci.yml)
[![Publish](https://github.com/kg0r0/twitter-oauth2/actions/workflows/npm.yml/badge.svg)](https://github.com/kg0r0/twitter-oauth2/actions/workflows/npm.yml)
[![CodeQL](https://github.com/kg0r0/twitter-oauth2/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/kg0r0/twitter-oauth2/actions/workflows/codeql-analysis.yml)
[![Coverage Status](https://coveralls.io/repos/github/kg0r0/twitter-oauth2/badge.svg?branch=main)](https://coveralls.io/github/kg0r0/twitter-oauth2?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Express.js middleware implementation for Twitter OAuth 2.0 Client.

This module supports the following grant type available on twitter:
- [Authorization Code Grant with PKCE](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code)
- [Client Credentials Grant](https://developer.twitter.com/en/docs/authentication/oauth-2-0/application-only)

**Table of Contents**
- [Install](#install)
- [Usage](#usage)
  - [Authorization Code Grant with PKCE](#authorization-code-grant-with-pkce)
    - [Confidential Client](#confidential-client)
    - [Public Client](#public-client)
  - [Client Credentials Grant](#client-credentials-grant)
- [API](#api)
  - [twitterOAuth2(options)](#twitteroauth2options)
    - [Options](#options)
    - [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Install
```bash
$ npm i twitter-oauth2
```

## Usage
```js
import express from 'express';
import session from 'express-session';
import { request } from 'undici';
import { twitterOAuth2 } from 'twitter-oauth2';

const app: express.Express = express();

/* ---- express-session ----*/
app.use(session({
  name: 'YOUR-SESSION-NAME',
  secret: 'YOUR-SECRET',
  resave: false,
  saveUninitialized: true
}))

app.use(twitterOAuth2({
  client_id: 'YOUR-CLIENT-ID',
  client_secret: 'YOUR-CLIENT-SECRET',
  redirect_uri: 'YOUR-REDIRECT-URI',
  scope: 'tweet.read users.read offline.access'
}))

app.get('/', async (req: express.Request, res: express.Response) => {
  const tokenSet = req.session.tokenSet;
  console.log('received tokens %j', req.session.tokenSet);
  const { body } = await request('https://api.twitter.com/2/users/me',
    {
      headers: {
        Authorization: `Bearer ${tokenSet?.access_token}`
      }
    });
  const username = (await body.json()).data.username;
  res.send(`Hello ${username}!`);
})
```
**Note** This module uses a session store that is compatible with [express-session](https://www.npmjs.com/package/express-session).

See the [example](https://github.com/kg0r0/twitter-oauth2/tree/main/example) for more details.

### Authorization Code Grant with PKCE

The required arguments depend on the client type.

#### Confidential Client

```js
app.use(twitterOAuth2({
  client_id: 'YOUR-CLIENT-ID',
  client_secret: 'YOUR-CLIENT-SECRET',
  redirect_uri: 'YOUR-REDIRECT-URI',
  scope: 'tweet.read users.read offline.access'
}))
```

#### Public Client

```js
app.use(twitterOAuth2({
  client_type: 'public',
  client_id: 'YOUR-CLIENT-ID',
  redirect_uri: 'YOUR-REDIRECT-URI',
  scope: 'tweet.read users.read offline.access'
}))
```

### Client Credentials Grant 

```js
app.use(twitterOAuth2({
  consumer_key: 'YOUR-CONSUMER-KEY',
  consumer_secret: 'YOUR-CONSUMER-SECRET',
  grant_type: 'client_credentials'
}))
```

## API

```js
import { twitterOAuth2 } from 'twitter-oauth2';
```

### twitterOAuth2(options)

Create a middleware with the given `options`.

#### Options
`twitterOAuth2` accepts these properties in the options object.

##### client_id

The identifier of the Client.
You can check it from the Developer Portal.
This option is used in case Authorization Code Grant.
This option can also be read from the environment variable `CLIENT_ID`.

##### client_secret

This is the secret information used for client authentication.
You can check it from the Developer Portal.
This option is used in the case of Authorization Code Grant and Confidential Client.
This option can also be read from the environment variable `CLIENT_SECRET`.

##### redirect_uri 

This is the callback URL that you registered on the Developer Portal.
This option can also be read from the environment variable `REDIRECT_URI`.

##### scope 

The scope of the access request.
Please see the [documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code) for available scopes.
The current default is `tweet.read users.read offline.access`.

##### client_type 
The [client type](https://datatracker.ietf.org/doc/html/rfc6749#section-2.1) is defined in OAuth2.0.
This value was set during the registration process.
The current default is `confidential`.

##### grant_type
The [grant_type](https://datatracker.ietf.org/doc/html/rfc6749#appendix-A.10) is defined in OAuth2.0.
The current default is `authorization_code`.

##### consumer_key

The client identifier.
In Client Credentials Grant, the consumer key is used as the client_id.
This option can also be read from the environment variable `CONSUMER_KEY`.

##### consumer_secret

The client secret.
In Client Credentials Grant, the consumer secret is used as the client_secret.
This option can also be read from the environment variable `CONSUMER_SECRET`.

#### Error Handling
Errors raised by this middleware are handled by [the default Express error handler](https://expressjs.com/en/guide/error-handling.html#the-default-error-handler). 
To write your error handler, see the Express documentation on writing [Custom error handlers](https://expressjs.com/en/guide/error-handling.html#writing-error-handlers).

## Contributing
Thanks for your feedback and contribution to this repo!
Please feel free to open issues and send pull-requests.

## License

[MIT](LICENSE)
