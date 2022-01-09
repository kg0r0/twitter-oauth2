import { twitterOAuth2, TwitterOAuth2Options, authorizationRequest } from '../src'
import { Issuer, BaseClient } from 'openid-client';
import express from 'express';
import session from 'express-session';
const request = require('supertest');

test('TwitterOAuth2 redirects the resource owner to twitter.', done => {
  const app = App();
  request(app)
    .get('/')
    .expect('Location', /^https:\/\/twitter.com\/i\/oauth2\/authorize.*/)
    .expect(
      302, done
    )
})

test('TwitterOAuth2 return a 403 status code when an asynchronous request is sent.', done => {
  const app = App();
  request(app)
    .get('/')
    .set('X-Requested-With', 'XMLHttpRequest')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(403, done)
})

test('authorizationRequest returns a authorization request url.', () => {
  const client = Client({}, {});
  const url = authorizationRequest(client, {
    state: 'TEST_STATE',
    codeChallenge: 'TEST_CODE_CHALLENGE',
    codeChallengeMethod: 'S256'
  })
  expect(url).toBe('https://localhost:5555/oauth2/authorize?client_id=TEST_CLIENT_ID&scope=tweet.read%20users.read%20offline.access&response_type=code&redirect_uri=TEST_REDIRECT_URI&state=TEST_STATE&code_challenge=TEST_CODE_CHALLENGE&code_challenge_method=S256')
})

function App(twitterOAuth2Options?: TwitterOAuth2Options, sessionOptions?: any) {
  const app: express.Express = express()
  app.use(session(sessionOptions || {
    name: 'TEST',
    secret: 'TEST-SECRET',
    cookie: {
      sameSite: 'lax'
    },
    resave: false,
    saveUninitialized: true
  }))
  app.use(twitterOAuth2(twitterOAuth2Options || {
    client_id: 'TEST_CLIENT_ID',
    client_secret: 'TEST_CLIENT_SECRET',
    redirect_uri: 'TEST_REDIRECT_URI'
  }));
  return app
}

function Client(issuerOptions: any, clientOptions: any): BaseClient {
  const issuer: Issuer = new Issuer({
    issuer: issuerOptions.issuer || 'https://localhost:5555',
    authorization_endpoint: issuerOptions.authorization_endpoint || 'https://localhost:5555/oauth2/authorize',
    token_endpoint: issuerOptions.token_endpoint || 'https://localhost/2/oauth2/token'
  });
  const client: BaseClient = new issuer.Client({
    client_id: clientOptions.client_id || 'TEST_CLIENT_ID',
    client_secret: clientOptions.client_secret || 'TEST_CLIENT_SECRET',
    redirect_uris: clientOptions.redirect_uri ? [clientOptions.redirect_uri] : ['TEST_REDIRECT_URI'],
    token_endpoint_auth_method: 'none'
  })
  return client
}