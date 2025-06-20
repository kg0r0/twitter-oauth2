import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import * as client from 'openid-client';

interface TokenSet {
  token_type: string;
  access_token: string;
  expires_at?: number;
  scope?: string;
  refresh_token?: string;
}

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

    const serverMetadata: client.ServerMetadata = {
      issuer: 'https://twitter.com',
      authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
      token_endpoint: 'https://api.twitter.com/2/oauth2/token',
    };
    const clientAuth = options.client_type == 'public' ? client.None() : client.ClientSecretBasic(clientSecret!);
    const config = new client.Configuration(serverMetadata, clientID, { redirect_uri: redirectURI }, clientAuth);
    if ((!req.session.isRedirected && !req.session.tokenSet)) {
      const state = client.randomState();
      const codeVerifier = client.randomPKCECodeVerifier();
      const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
      const url = client.buildAuthorizationUrl(config, {
        state,
        scope: options.scope || 'tweet.read users.read offline.access',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      }).toString();
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
      const host = req.headers.host || 'localhost';
      const currentUrl = new URL(req.url!, `http://${host}`);
      const tokenSet = await client.authorizationCodeGrant(config, currentUrl, {
        pkceCodeVerifier: codeVerifier,
        expectedState: state,
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
    const serverMetadata: client.ServerMetadata = {
      issuer: 'https://twitter.com',
      token_endpoint: 'https://api.twitter.com/oauth2/token',
    };
    const config = new client.Configuration(serverMetadata, clientID, clientSecret);
    const params: Record<string, string> = {};
    if (options.scope) {
      params.scope = options.scope;
    }
    const tokenSet = await client.clientCredentialsGrant(config, params);
    req.session.tokenSet = tokenSet;
    next();
    return
  } catch (err) {
    next(err);
    return
  }
}

// Helper function is no longer needed - functionality moved inline

// Helper function is no longer needed - functionality moved inline