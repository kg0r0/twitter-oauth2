/// <reference types="qs" />
/// <reference types="express" />
/// <reference types="connect" />
import { TwitterOAuth2Options } from './oauth2';
/**
 * Returns a new middleware.
 *
 * @param {TwitterOAuth2Options} options
 * @returns {function} middleware
 */
export declare const twitterOAuth2: (options?: TwitterOAuth2Options) => (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("connect").NextFunction) => Promise<void | import("express").Response<any, Record<string, any>>>;
