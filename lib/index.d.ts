/// <reference types="qs" />
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { BaseClient, TokenSet } from 'openid-client';
declare module 'express-session' {
    interface SessionData {
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
 * @param {Options} options
 * @returns {function} middleware
 */
export declare const twitterOAuth2: (options: TwitterOAuth2Options) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function authorizationRequest(client: BaseClient, options: AuthorizationRequestOptions): string;
export declare function tokenRequest(req: Request, client: BaseClient, options: TokenRequestOptions): Promise<TokenSet>;
