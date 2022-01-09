import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { Issuer, generators, IssuerMetadata, BaseClient, TokenSet } from 'openid-client';

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

export interface TwitterOAuth2Options {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  scope?: string;
  type_of_app?: 'confidential' | 'public';
}

export interface AuthorizationRequestOptions {
  state: string;
  scope?: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

export interface TokenRequestOptions {
  client_id: string;
  redirect_uri: string;
  codeVerifier: string;
  state: string;
}

/**
 * Returns a new middleware.
 * 
 * @param {TwitterOAuth2Options} options
 * @returns {function} middleware
 */
export const twitterOAuth2 = function (options: TwitterOAuth2Options) {
  return twitterOAuth2Handler.bind(undefined, options);
};

/**
 * Returns a middleware that checks whether an resource owner is authorized.
 *  
 * @param {TwitterOAuth2Client} options 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 * @returns 
 */
async function twitterOAuth2Handler(options: TwitterOAuth2Options, req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session)
      throw new Error('express-session is not configured');
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
    if ((!req.session.isRedirected && !req.session.tokenSet)) {
      const state = generators.state();
      const codeVerifier = generators.codeVerifier();
      const codeChallenge = generators.codeChallenge(codeVerifier);
      const url = authorizationRequest(client, {
        state,
        scope: options.scope,
        codeChallenge: codeChallenge,
        codeChallengeMethod: 'S256',
      })
      req.session.state = state;
      req.session.codeVerifier = codeVerifier;
      req.session.originalUrl = req.originalUrl;
      req.session.isRedirected = true;
      if (req.xhr) {
        return res.status(403).json({ location: url });
      }
      return res.redirect(url);
    } else if (req.session.isRedirected && !req.session.tokenSet) {
      const state = req.session.state;
      if (typeof state != 'string')
        throw new Error('state must be a string');
      const codeVerifier = req.session.codeVerifier;
      if (typeof codeVerifier != 'string')
        throw new Error('client_verifier must be a string');
      const tokenSet = await tokenRequest(req, client, {
        redirect_uri: clientConfig.redirect_uri,
        client_id: clientConfig.client_id,
        codeVerifier,
        state: state,
      });
      req.session.tokenSet = tokenSet;
      if (typeof req.session.originalUrl != 'string')
        throw new Error('originalUrl must be a string')
      if (req.xhr) {
        return res.json({ location: req.session.originalUrl });
      }
      return res.redirect(req.session.originalUrl);
    }
  } catch (err) {
    next(err);
    return
  }
  next();
  return
}

/**
 * Returns a Authorization Request URL.
 * 
 * @param {BaseClient} client 
 * @param {AuthorizationRequestOptions} options 
 * @returns {string}
 */
export function authorizationRequest(client: BaseClient, options: AuthorizationRequestOptions): string {
  const url: string = client.authorizationUrl({
    response_type: 'code',
    scope: options.scope || 'tweet.read users.read offline.access',
    state: options.state,
    code_challenge: options.codeChallenge,
    code_challenge_method: options.codeChallengeMethod
  });
  return url;
}

/**
 * Returns a Token Response.
 * 
 * @param {Request} req 
 * @param {BaseClient} client 
 * @param {TokenRequestOptions} options 
 * @returns {Promise<TokenSet>}
 */
export async function tokenRequest(req: Request, client: BaseClient, options: TokenRequestOptions): Promise<TokenSet> {
  const state = options.state;
  const codeVerifier = options.codeVerifier;
  const params = client.callbackParams(req);
  const tokenSet = await client.oauthCallback(options.redirect_uri, params, { code_verifier: codeVerifier, state }, { exchangeBody: { client_id: options.client_id } });
  return tokenSet;
}