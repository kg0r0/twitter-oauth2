import { twitterOAuth2 } from '../lib'
import express from 'express';
import session from 'express-session';
const request = require('supertest');

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
  client_id: 'TEST_CLIENT_ID',
  client_secret: 'TEST_CLIENT_SECRET',
  redirect_uri: 'TEST_REDIRECT_URI'
}));

test('TwitterOAuth2 redirects the resource owner to twitter.', done => {
  request(app)
    .get('/')
    .expect('Location', /^https:\/\/twitter.com\/i\/oauth2\/authorize.*/)
    .expect(
      302, done
    )
})