import express from 'express';
import session from 'express-session';
const crypto = require('crypto');
const twitterOAuth2 =  require('../../lib/');
const app: express.Express = express();

const PORT = 3000;

declare module 'express-session' {
  export interface Session {
    tokenSet: Object
  }
}

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

app.get('/', (req: express.Request, res: express.Response) => {
  console.log('received tokens %j', req.session.tokenSet);
  res.send('Hello World!');
})

app.listen(PORT, () => {
  console.log(`listen port: ${PORT}`);
});