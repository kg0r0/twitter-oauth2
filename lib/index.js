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
        while (_) try {
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
exports.twitterOAuth2 = void 0;
var openid_client_1 = require("openid-client");
var twitterOAuth2 = function (options) {
    return twitterOAuth2Handler.bind(undefined, options);
};
exports.twitterOAuth2 = twitterOAuth2;
/**
 * Returns a middleware that checks whether an resource owner is authorized.
 *
 * @param options
 * @param req
 * @param res
 * @param next
 * @returns
 */
function twitterOAuth2Handler(options, req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var clientID, clientSecret, redirectURI, clientConfig, issOpt, issuer, client, url, state, codeVerifier, params, tokenSet, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    clientID = options.client_id || process.env.CLIENT_ID;
                    if (typeof clientID != 'string')
                        throw new Error('client_id must be a string');
                    clientSecret = options.client_secret || process.env.CLIENT_SECRET;
                    redirectURI = options.redirect_uri || process.env.REDIRECT_URI;
                    if (typeof redirectURI != 'string')
                        throw new Error('redirect_uri must be a string');
                    clientConfig = {
                        client_id: clientID,
                        client_secret: clientSecret,
                        redirect_uri: redirectURI,
                        type_of_app: options.type_of_app
                    };
                    issOpt = {
                        issuer: 'https://twitter.com',
                        authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
                        token_endpoint: 'https://api.twitter.com/2/oauth2/token'
                    };
                    issuer = new openid_client_1.Issuer(issOpt);
                    client = new issuer.Client({
                        client_id: clientConfig.client_id,
                        client_secret: clientConfig.client_secret,
                        redirect_uris: [clientConfig.redirect_uri],
                        token_endpoint_auth_method: clientConfig.type_of_app == 'public' ? 'none' : 'client_secret_basic',
                    });
                    if (!(req.session && (!req.session.isRedirected && !req.session.tokenSet))) return [3 /*break*/, 1];
                    url = authorizationRequest(req, client, options);
                    return [2 /*return*/, res.redirect(url)];
                case 1:
                    if (!(req.session && req.session.isRedirected && !req.session.tokenSet)) return [3 /*break*/, 3];
                    state = req.session.state;
                    codeVerifier = req.session.codeVerifier;
                    params = client.callbackParams(req);
                    return [4 /*yield*/, client.oauthCallback(clientConfig.redirect_uri, params, { code_verifier: codeVerifier, state: state }, { exchangeBody: { client_id: clientConfig.client_id } })];
                case 2:
                    tokenSet = _a.sent();
                    req.session.tokenSet = tokenSet;
                    if (typeof req.session.originalUrl != 'string')
                        throw new Error('originalUrl must be a string');
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
function authorizationRequest(req, client, options) {
    var state = openid_client_1.generators.state();
    var codeVerifier = openid_client_1.generators.codeVerifier();
    var codeChallenge = openid_client_1.generators.codeChallenge(codeVerifier);
    var url = client.authorizationUrl({
        response_type: 'code',
        scope: options.scope || 'tweet.read users.read offline.access',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
    req.session.state = state;
    req.session.codeVerifier = codeVerifier;
    req.session.originalUrl = req.originalUrl;
    req.session.isRedirected = true;
    return url;
}
