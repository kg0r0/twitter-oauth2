import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { Issuer, generators, IssuerMetadata, BaseClient, TokenSet } from 'openid-client';
// TODO: Read from configuration file
// import config from 'config';

declare module 'express-session' {
  export interface SessionData {
    tokenSet: TokenSet;
    isRedirected: boolean;
    state: string;
    codeVerifier: string;
    originalUrl: string;
  }
}

export interface TwitterOAuth2Client {
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
  type_of_app?: string;
}

export interface Options {
  client_id?: string
  client_secret?: string;
  redirect_uri?: string;
  scope?: string
  type_of_app?: 'confidential' | 'public' 
}

module.exports = function TwitterOAuth2(options: Options) {
  return twitterOAuth2Handler.bind(undefined, options);
};

/**
 * Returns a middleware that checks whether an resource owner is authorized.
 *  
 * @param options 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
async function twitterOAuth2Handler(options: Options, req: Request, res: Response, next: NextFunction) {
  try {
    const clientID = options.client_id || process.env.CLIENT_ID;
    if (typeof clientID != 'string')
      throw new Error('client_id must be a string');
    const clientSecret = options.client_secret || process.env.CLIENT_SECRET;
    const redirectURI = options.redirect_uri || process.env.REDIRECT_URI;
    if (typeof redirectURI != 'string')
      throw new Error('redirect_uri must be a string');

    const clientConfig: TwitterOAuth2Client = {
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uri: redirectURI,
      type_of_app: options.type_of_app
    };
    const issOpt: IssuerMetadata = {
      issuer: 'https://twitter.com',
      authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
      token_endpoint: 'https://api.twitter.com/2/oauth2/token'
    }
    const issuer: Issuer = new Issuer(issOpt);
    const client: BaseClient = new issuer.Client({
      client_id: clientConfig.client_id,
      client_secret: clientConfig.client_secret,
      redirect_uris: [clientConfig.redirect_uri],
      token_endpoint_auth_method: clientConfig.type_of_app == 'public' ? 'none' : 'client_secret_basic',
    });
    if (req.session && (!req.session.isRedirected && !req.session.tokenSet)) {
      const url = authorizationRequest(req, client, options)
      return res.redirect(url);
    } else if (req.session && req.session.isRedirected && !req.session.tokenSet) {
      const state = req.session.state;
      const codeVerifier = req.session.codeVerifier;
      const params = client.callbackParams(req);
      const tokenSet = await client.oauthCallback(clientConfig.redirect_uri, params, { code_verifier: codeVerifier, state }, { exchangeBody: { client_id: clientConfig.client_id } });
      req.session.tokenSet = tokenSet;
      if (typeof req.session.originalUrl != 'string')
        throw new Error('originalUrl must be a string')
      return res.redirect(req.session.originalUrl);
    }
  } catch (err) {
    next(err);
    return
  }
  next();
  return
}

function authorizationRequest(req: Request, client: BaseClient, options: any): string {
  const state = generators.state();
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const url: string = client.authorizationUrl({
    response_type: 'code',
    scope: options.scope || 'tweet.read users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  req.session.state = state;
  req.session.codeVerifier = codeVerifier;
  req.session.originalUrl = req.originalUrl;
  req.session.isRedirected = true;
  return url;
}