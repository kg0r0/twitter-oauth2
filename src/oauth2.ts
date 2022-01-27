import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { Issuer, generators, IssuerMetadata, BaseClient, TokenSet } from 'openid-client';

declare module 'express-session' {
  export interface SessionData {
    tokenSet: TokenSet;
    isRedirected: boolean;
    state: string;
    code_verifier: string;
    originalUrl: string;
  }
}

export interface TwitterOAuth2Options {
  client_id?: string;
  consumer_key?: string;
  client_secret?: string;
  consumer_secret?: string;
  redirect_uri?: string;
  scope?: string;
  client_type?: 'confidential' | 'public';
  grant_type?: 'authorization_code' | 'client_credentials';
}

export interface AuthorizationRequestOptions {
  state: string;
  scope?: string;
  code_challenge: string;
  code_challenge_method: string;
}

export interface TokenRequestOptions {
  client_id: string;
  redirect_uri: string;
  code_verifier: string;
  state: string;
}

/**
 * Returns a middleware for Authorization Code Grant.
 *  
 * @param {TwitterOAuth2Options} options 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 * @returns 
 */
export async function authorizationCodeGrant(options: TwitterOAuth2Options, req: Request, res: Response, next: NextFunction) {
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

    const issOpt: IssuerMetadata = {
      issuer: 'https://twitter.com',
      authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
      token_endpoint: 'https://api.twitter.com/2/oauth2/token'
    }
    const issuer: Issuer = new Issuer(issOpt);
    const client: BaseClient = new issuer.Client({
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uris: [redirectURI],
      token_endpoint_auth_method: options.client_type == 'public' ? 'none' : 'client_secret_basic',
    });
    if ((!req.session.isRedirected && !req.session.tokenSet)) {
      const state = generators.state();
      const codeVerifier = generators.codeVerifier();
      const codeChallenge = generators.codeChallenge(codeVerifier);
      const url = authorizationRequest(client, {
        state,
        scope: options.scope,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })
      req.session.state = state;
      req.session.code_verifier = codeVerifier;
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
      const codeVerifier = req.session.code_verifier;
      if (typeof codeVerifier != 'string')
        throw new Error('code_verifier must be a string');
      const tokenSet = await tokenRequest(req, client, {
        redirect_uri: redirectURI,
        client_id: clientID,
        code_verifier: codeVerifier,
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
 * Returns a middleware for Client Credentials Grant.
 * 
 * @param {TwitterOAuth2Options} options 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 * @returns 
 */
export async function clientCredentialsGrant(options: TwitterOAuth2Options, req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session)
      throw new Error('express-session is not configured');
    if (req.session.tokenSet) {
      next()
      return
    }
    const clientID = options.consumer_key || process.env.CONSUMER_KEY;
    if (typeof clientID != 'string')
      throw new Error('consumer_key must be a string');
    const clientSecret = options.consumer_secret || process.env.CONSUMER_SECRET;
    if (typeof clientSecret != 'string')
      throw new Error('consumer_secret must be a string');
    const issuer = new Issuer({
      issuer: 'https://twitter.com',
      token_endpoint: 'https://api.twitter.com/oauth2/token'
    });
    const client = new issuer.Client({
      client_id: clientID,
      client_secret: clientSecret,
    });
    const tokenSet = await client.grant({
      grant_type: 'client_credentials',
    })
    req.session.tokenSet = tokenSet;
    next();
    return
  } catch (err) {
    next(err);
    return
  }
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
    code_challenge: options.code_challenge,
    code_challenge_method: options.code_challenge_method
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
  const codeVerifier = options.code_verifier;
  const params = client.callbackParams(req);
  const tokenSet = await client.oauthCallback(options.redirect_uri, params, { code_verifier: codeVerifier, state }, { exchangeBody: { client_id: options.client_id } });
  return tokenSet;
}