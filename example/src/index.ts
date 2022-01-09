import express from 'express';
import session from 'express-session';
import { twitterOAuth2 } from '../../lib/';
import crypto from 'crypto';
import axios from 'axios';

const app: express.Express = express();

const PORT = 3000;

app.use(session({
  name: 'EXAMPLE',
  secret: [crypto.randomBytes(32).toString('hex')],
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

app.listen(PORT, () => {
  console.log(`listen port: ${PORT}`);
});