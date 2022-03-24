import express, { ErrorRequestHandler } from 'express';
import session from 'express-session';
import { twitterOAuth2 } from 'twitter-oauth2';
import crypto from 'crypto';
import { request } from 'undici';

const app: express.Express = express();

const PORT = 3000;

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ err: { message: err.message } });
};

app.use(session({
  name: 'EXAMPLE',
  secret: [crypto.randomBytes(32).toString('hex')],
  cookie: {
    sameSite: 'lax'
  },
  resave: false,
  saveUninitialized: true
}))

app.use(twitterOAuth2({
  grant_type: 'client_credentials'
}))

app.use(errorHandler);

app.get('/', async (req: express.Request, res: express.Response) => {
  const tokenSet = req.session.tokenSet;
  console.log('received tokens %j', req.session.tokenSet);
  const { body } = await request('https://api.twitter.com/1.1/statuses/user_timeline.json?count=3&screen_name=twitterapi',
    {
      headers: {
        Authorization: `Bearer ${tokenSet?.access_token}`
      }
    });
  const data = await body.json();
  res.send(data);
})

app.listen(PORT, () => {
  console.log(`listen port: ${PORT}`);
});