import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { BaseClient, TokenSet } from 'openid-client';
declare module 'express-session' {
    interface SessionData {
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
export declare function authorizationCodeGrant(options: TwitterOAuth2Options, req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
/**
 * Returns a middleware for Client Credentials Grant.
 *
 * @param {TwitterOAuth2Options} options
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
 */
export declare function clientCredentialsGrant(options: TwitterOAuth2Options, req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Returns a Authorization Request URL.
 *
 * @param {BaseClient} client
 * @param {AuthorizationRequestOptions} options
 * @returns {string}
 */
export declare function authorizationRequest(client: BaseClient, options: AuthorizationRequestOptions): string;
/**
 * Returns a Token Response.
 *
 * @param {Request} req
 * @param {BaseClient} client
 * @param {TokenRequestOptions} options
 * @returns {Promise<TokenSet>}
 */
export declare function tokenRequest(req: Request, client: BaseClient, options: TokenRequestOptions): Promise<TokenSet>;
/**
 * Refreshing an Access Token.
 *
 * @param {Request} req
 * @param {BaseClient} client
 * @returns {Promise<TokenSet>}
 */
export declare function refreshTokenGrant(req: Request, client: BaseClient): Promise<TokenSet>;
