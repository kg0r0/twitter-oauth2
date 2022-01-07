import { twitterOAuth2 } from '../lib'
const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const request = require('supertest');

const app = express();

app.use(cookieSession({
  keys: 'TEST_SECRET'
}))

app.use(cookieParser())
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