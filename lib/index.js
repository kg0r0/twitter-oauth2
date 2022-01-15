"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twitterOAuth2 = void 0;
var oauth2_1 = require("./oauth2");
/**
 * Returns a new middleware.
 *
 * @param {TwitterOAuth2Options} options
 * @returns {function} middleware
 */
var twitterOAuth2 = function (options) {
    if (options.grant_type == 'client_credentials') {
        return oauth2_1.clientCredentialsGrant.bind(undefined, options);
    }
    return oauth2_1.authorizationCodeGrant.bind(undefined, options);
};
exports.twitterOAuth2 = twitterOAuth2;
