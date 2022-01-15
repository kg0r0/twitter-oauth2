import { twitterOAuth2 } from '../src'
import { TwitterOAuth2Options } from '../src/oauth2'
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import { ErrorRequestHandler } from 'express-serve-static-core';
import nock from 'nock';

beforeEach(() => {
  nock('https://api.twitter.com')
    .post('/2/oauth2/token')
    .basicAuth({ user: 'TEST_CLIENT_ID', pass: 'TEST_CLIENT_SECRET' })
    .reply(200, {
      token_type: 'bearer',
      expires_at: 1095379198,
      access_token: 'TEST_ACCESS_TOKEN',
      scope: 'TEST_SCOPE',
      refresh_token: 'TEST_REFRESH_TOKEN'
    })
  nock('https://api.twitter.com')
    .post('/oauth2/token')
    .basicAuth({ user: 'TEST_CONSUMER_KEY', pass: 'TEST_CONSUMER_SECRET' })
    .reply(200, {
      token_type: 'bearer',
      access_token: 'TEST_ACCESS_TOKEN'
    })
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ err: { message: err.message } });
};

describe('TwitterOAuth2', () => {
  it('redirects the resource owner to twitter.', done => {
    const app = App();
    request(app)
      .get('/')
      .expect('Location', /^https:\/\/twitter.com\/i\/oauth2\/authorize.*/)
      .expect(
        302, done
      )
  })

  it('returns a 500 status code when client_id is not set.', done => {
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
    }))
    app.get('/user', (req: express.Request, res: express.Response) => {
      res.status(200).json({ name: 'john' });
    });
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

  it('returns a 500 status code when redirect_uri is not set.', done => {
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
    }))
    app.get('/user', (req: express.Request, res: express.Response) => {
      res.status(200).json({ name: 'john' });
    });
    app.use(errorHandler);
    request(app)
      .get('/user')
      .expect(500)
      .then(res => {
        expect(res.text).toBe('{"err":{"message":"redirect_uri must be a string"}}');
        done();
      })
      .catch(err => done(err))
  })

  it('returns a 403 status code when an asynchronous request is sent.', done => {
    const app = App();
    request(app)
      .get('/')
      .set('X-Requested-With', 'XMLHttpRequest')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(403, done)
  })

  it('returns a 500 status code when express-session is not set.', done => {
    const app: express.Express = express();
    app.use(twitterOAuth2({
      client_id: 'TEST_CLIENT_ID',
      client_secret: 'TEST_CLIENT_SECRET',
      redirect_uri: 'TEST_REDIRECT_URI'
    }))
    app.get('/user', (req: express.Request, res: express.Response) => {
      res.status(200).json({ name: 'john' });
    });
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

  it('return a 500 status code when client_id is not set.', done => {
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

  it('returns a 200 status code (Client Credentials Grant).', done => {
    const app = App({
      consumer_key: 'TEST_CONSUMER_KEY',
      consumer_secret: 'TEST_CONSUMER_SECRET',
      grant_type: 'client_credentials'
    });
    app.get('/', (req: express.Request, res: express.Response) => {
      res.status(200).json({ status: req.session.tokenSet });
    });
    request(app)
      .get('/')
      .expect(
        200, done
      )
  })

  it('returns a 500 status code when express-session is not set (Client Credentials Grant).', done => {
    const app: express.Express = express();
    app.use(twitterOAuth2({
      consumer_key: 'TEST_CONSUMER_KEY',
      consumer_secret: 'TEST_CONSUMER_SECRET',
      grant_type: 'client_credentials'
    }))
    app.get('/user', (req: express.Request, res: express.Response) => {
      res.status(200).json({ name: 'john' });
    });
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

  it('returns a 500 status code when consumer_key is not set (Client Credentials Grant).', done => {
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
      grant_type: 'client_credentials'
    }))
    app.get('/user', (req: express.Request, res: express.Response) => {
      res.status(200).json({ name: 'john' });
    });
    app.use(errorHandler);
    request(app)
      .get('/user')
      .expect(500)
      .then(res => {
        expect(res.text).toBe('{"err":{"message":"consumer_key must be a string"}}');
        done();
      })
      .catch(err => done(err))
  })

  it('returns a 500 status code when consumer_secret is not set (Client Credentials Grant).', done => {
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
      consumer_key: 'TEST_CONSUMER_KEY',
      grant_type: 'client_credentials'
    }))
    app.get('/user', (req: express.Request, res: express.Response) => {
      res.status(200).json({ name: 'john' });
    });
    app.use(errorHandler);
    request(app)
      .get('/user')
      .expect(500)
      .then(res => {
        expect(res.text).toBe('{"err":{"message":"consumer_secret must be a string"}}');
        done();
      })
      .catch(err => done(err))
  })

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
    consumer_key: 'TEST_CONSUMER_KEY',
    client_secret: 'TEST_CLIENT_SECRET',
    consumer_secret: 'TEST_CONSUMER_SECRET',
    redirect_uri: 'TEST_REDIRECT_URI',
  }));
  return app
}
