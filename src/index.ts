import { TwitterOAuth2Options, authorizationCodeGrant, clientCredentialsGrant} from './oauth2'

/**
 * Returns a new middleware.
 * 
 * @param {TwitterOAuth2Options} options
 * @returns {function} middleware
 */
export const twitterOAuth2 = function (options: TwitterOAuth2Options) {
  if (options.grant_type == 'client_credentials') {
    return clientCredentialsGrant.bind(undefined, options);
  }
  return authorizationCodeGrant.bind(undefined, options);
};
