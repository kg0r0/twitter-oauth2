// Mock implementation of openid-client for testing
module.exports = {
  Configuration: function(serverMetadata, clientId, metadata, clientAuth) {
    this.serverMetadata = serverMetadata;
    this.clientId = clientId;
    this.metadata = metadata;
    this.clientAuth = clientAuth;
  },
  
  randomState: () => 'MOCK_STATE',
  randomPKCECodeVerifier: () => 'MOCK_CODE_VERIFIER',
  calculatePKCECodeChallenge: (verifier) => Promise.resolve('MOCK_CODE_CHALLENGE'),
  
  buildAuthorizationUrl: (config, params) => {
    const url = new URL(config.serverMetadata.authorization_endpoint || 'https://twitter.com/i/oauth2/authorize');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('scope', params.scope || 'tweet.read users.read offline.access');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', config.metadata.redirect_uri || 'TEST_REDIRECT_URI');
    url.searchParams.set('state', params.state);
    url.searchParams.set('code_challenge', params.code_challenge);
    url.searchParams.set('code_challenge_method', params.code_challenge_method);
    return url;
  },
  
  authorizationCodeGrant: (config, url, checks) => {
    return Promise.resolve({
      token_type: 'bearer',
      expires_at: 1095379198,
      access_token: 'TEST_ACCESS_TOKEN',
      scope: 'TEST_SCOPE',
      refresh_token: 'TEST_REFRESH_TOKEN'
    });
  },
  
  clientCredentialsGrant: (config, params) => {
    return Promise.resolve({
      token_type: 'bearer',
      access_token: 'TEST_ACCESS_TOKEN'
    });
  },
  
  ClientSecretBasic: (secret) => {
    return function(as, client, body, headers) {
      // Mock implementation
    };
  },
  
  None: () => {
    return function(as, client, body, headers) {
      // Mock implementation
    };
  }
};