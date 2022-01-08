import { twitterOAuth2, Options } from '../lib'
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

function App(twitterOAuth2Options?: Options, sessionOptions?: any) {
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