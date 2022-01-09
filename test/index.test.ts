import { twitterOAuth2, TwitterOAuth2Options, authorizationRequest } from '../src'
import { Issuer, BaseClient } from 'openid-client';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import { ErrorRequestHandler } from 'express-serve-static-core';

interface IssuerOptions {
  issuer?: string
  authorization_endpoint?: string
  token_endpoint?: string
}

interface ClientOptions {
  client_id?: string
  client_secret?: string
  redirect_uri?: string
}

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

test('TwitterOAuth2 return a 500 status code when express-session is not set.', done => {
  const app: express.Express = express();
  app.use(twitterOAuth2({
    client_id: 'TEST_CLIENT_ID',
    client_secret: 'TEST_CLIENT_SECRET',
    redirect_uri: 'TEST_REDIRECT_URI'
  }))
  app.get('/user', (req: express.Request, res: express.Response) => {
    res.status(200).json({ name: 'john' });
  });
  // eslint-disable-next-line no-unused-vars
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({ err: { message: err.message } });
  };
  app.use(errorHandler);
  request(app)
    .get('/user')
    .expect(500)
    .then(res => {
      expect(res.text).toBe('{"err":{"message":"express-session is not configured"}}');
      done();
    })
    .catch(err => done(err))
})

test('TwitterOAuth2 return a 500 status code when client_id is not set.', done => {
  const app: express.Express = express();
  app.use(session({
    name: 'TEST',
    secret: 'TEST-SECRET',
    cookie: {
      sameSite: 'lax'
    },
    resave: false,
    saveUninitialized: true
  }))
  app.use(twitterOAuth2({
    client_secret: 'TEST_CLIENT_SECRET',
    redirect_uri: 'TEST_REDIRECT_URI'
  }))
  app.get('/user', (req: express.Request, res: express.Response) => {
    res.status(200).json({ name: 'john' });
  });
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({ err: { message: err.message } });
  };
  app.use(errorHandler);
  request(app)
    .get('/user')
    .expect(500)
    .then(res => {
      expect(res.text).toBe('{"err":{"message":"client_id must be a string"}}');
      done();
    })
    .catch(err => done(err))
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

function App(twitterOAuth2Options?: TwitterOAuth2Options, sessionOptions?: session.SessionOptions) {
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

function Client(issuerOptions: IssuerOptions, clientOptions: ClientOptions): BaseClient {
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