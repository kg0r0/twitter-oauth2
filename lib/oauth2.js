"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenGrant = exports.tokenRequest = exports.authorizationRequest = exports.clientCredentialsGrant = exports.authorizationCodeGrant = void 0;
var openid_client_1 = require("openid-client");
/**
 * Returns a middleware for Authorization Code Grant.
 *
 * @param {TwitterOAuth2Options} options
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
 */
function authorizationCodeGrant(options, req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var clientID, clientSecret, redirectURI, issOpt, issuer, client, state, codeVerifier, codeChallenge, url, state, codeVerifier, tokenSet, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!req.session)
                        throw new Error('express-session is not configured');
                    clientID = options.client_id || process.env.CLIENT_ID;
                    if (typeof clientID != 'string')
                        throw new Error('client_id must be a string');
                    clientSecret = options.client_secret || process.env.CLIENT_SECRET;
                    redirectURI = options.redirect_uri || process.env.REDIRECT_URI;
                    if (typeof redirectURI != 'string')
                        throw new Error('redirect_uri must be a string');
                    issOpt = {
                        issuer: 'https://twitter.com',
                        authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
                        token_endpoint: 'https://api.twitter.com/2/oauth2/token'
                    };
                    issuer = new openid_client_1.Issuer(issOpt);
                    client = new issuer.Client({
                        client_id: clientID,
                        client_secret: clientSecret,
                        redirect_uris: [redirectURI],
                        token_endpoint_auth_method: options.client_type == 'public' ? 'none' : 'client_secret_basic',
                    });
                    if (!(!req.session.isRedirected && !req.session.tokenSet)) return [3 /*break*/, 1];
                    state = openid_client_1.generators.state();
                    codeVerifier = openid_client_1.generators.codeVerifier();
                    codeChallenge = openid_client_1.generators.codeChallenge(codeVerifier);
                    url = authorizationRequest(client, {
                        state: state,
                        scope: options.scope,
                        code_challenge: codeChallenge,
                        code_challenge_method: 'S256',
                    });
                    req.session.state = state;
                    req.session.code_verifier = codeVerifier;
                    req.session.originalUrl = req.originalUrl;
                    req.session.isRedirected = true;
                    if (req.xhr) {
                        return [2 /*return*/, res.status(403).json({ location: url })];
                    }
                    return [2 /*return*/, res.redirect(url)];
                case 1:
                    if (!(req.session.isRedirected && !req.session.tokenSet)) return [3 /*break*/, 3];
                    state = req.session.state;
                    if (typeof state != 'string')
                        throw new Error('state must be a string');
                    codeVerifier = req.session.code_verifier;
                    if (typeof codeVerifier != 'string')
                        throw new Error('code_verifier must be a string');
                    return [4 /*yield*/, tokenRequest(req, client, {
                            redirect_uri: redirectURI,
                            client_id: clientID,
                            code_verifier: codeVerifier,
                            state: state,
                        })];
                case 2:
                    tokenSet = _a.sent();
                    req.session.tokenSet = tokenSet;
                    if (typeof req.session.originalUrl != 'string')
                        throw new Error('originalUrl must be a string');
                    if (req.xhr) {
                        return [2 /*return*/, res.json({ location: req.session.originalUrl })];
                    }
                    return [2 /*return*/, res.redirect(req.session.originalUrl)];
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    next(err_1);
                    return [2 /*return*/];
                case 5:
                    next();
                    return [2 /*return*/];
            }
        });
    });
}
exports.authorizationCodeGrant = authorizationCodeGrant;
/**
 * Returns a middleware for Client Credentials Grant.
 *
 * @param {TwitterOAuth2Options} options
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
 */
function clientCredentialsGrant(options, req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var clientID, clientSecret, issuer, client, tokenSet, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session)
                        throw new Error('express-session is not configured');
                    if (req.session.tokenSet) {
                        next();
                        return [2 /*return*/];
                    }
                    clientID = options.consumer_key || process.env.CONSUMER_KEY;
                    if (typeof clientID != 'string')
                        throw new Error('consumer_key must be a string');
                    clientSecret = options.consumer_secret || process.env.CONSUMER_SECRET;
                    if (typeof clientSecret != 'string')
                        throw new Error('consumer_secret must be a string');
                    issuer = new openid_client_1.Issuer({
                        issuer: 'https://twitter.com',
                        token_endpoint: 'https://api.twitter.com/oauth2/token'
                    });
                    client = new issuer.Client({
                        client_id: clientID,
                        client_secret: clientSecret,
                    });
                    return [4 /*yield*/, client.grant({
                            grant_type: 'client_credentials',
                        })];
                case 1:
                    tokenSet = _a.sent();
                    req.session.tokenSet = tokenSet;
                    next();
                    return [2 /*return*/];
                case 2:
                    err_2 = _a.sent();
                    next(err_2);
                    return [2 /*return*/];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.clientCredentialsGrant = clientCredentialsGrant;
/**
 * Returns a Authorization Request URL.
 *
 * @param {BaseClient} client
 * @param {AuthorizationRequestOptions} options
 * @returns {string}
 */
function authorizationRequest(client, options) {
    var url = client.authorizationUrl({
        response_type: 'code',
        scope: options.scope || 'tweet.read users.read offline.access',
        state: options.state,
        code_challenge: options.code_challenge,
        code_challenge_method: options.code_challenge_method
    });
    return url;
}
exports.authorizationRequest = authorizationRequest;
/**
 * Returns a Token Response.
 *
 * @param {Request} req
 * @param {BaseClient} client
 * @param {TokenRequestOptions} options
 * @returns {Promise<TokenSet>}
 */
function tokenRequest(req, client, options) {
    return __awaiter(this, void 0, void 0, function () {
        var state, codeVerifier, params, tokenSet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = options.state;
                    codeVerifier = options.code_verifier;
                    params = client.callbackParams(req);
                    return [4 /*yield*/, client.oauthCallback(options.redirect_uri, params, { code_verifier: codeVerifier, state: state }, { exchangeBody: { client_id: options.client_id } })];
                case 1:
                    tokenSet = _a.sent();
                    return [2 /*return*/, tokenSet];
            }
        });
    });
}
exports.tokenRequest = tokenRequest;
/**
 * Refreshing an Access Token.
 *
 * @param {Request} req
 * @param {BaseClient} client
 * @returns {Promise<TokenSet>}
 */
function refreshTokenGrant(req, client) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenSet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session.tokenSet || !req.session.tokenSet.refresh_token)
                        throw new Error('Refresh Token is missing');
                    return [4 /*yield*/, client.refresh(req.session.tokenSet.refresh_token)];
                case 1:
                    tokenSet = _a.sent();
                    return [2 /*return*/, tokenSet];
            }
        });
    });
}
exports.refreshTokenGrant = refreshTokenGrant;
