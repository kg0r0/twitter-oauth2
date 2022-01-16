import { authorizationCodeGrant, authorizationRequest, clientCredentialsGrant, tokenRequest } from '../src/oauth2'
import { Issuer, BaseClient } from 'openid-client';
import express from 'express';
import nock from 'nock';

beforeEach(() => {
  nock('https://api.twitter.com')
    .post('/2/oauth2/token')
    .basicAuth({ user: 'TEST_CLIENT_ID', pass: 'TEST_CLIENT_SECRET' })
    .reply(200, {
      token_type: 'bearer',
      expires_at: 1095379198,
      access_token: 'TEST_ACCESS_TOKEN',
      scope: 'TEST_SCOPE',
      refresh_token: 'TEST_REFRESH_TOKEN'
    })
  nock('https://api.twitter.com')
    .post('/oauth2/token')
    .basicAuth({ user: 'TEST_CONSUMER_KEY', pass: 'TEST_CONSUMER_SECRET' })
    .reply(200, {
      token_type: 'bearer',
      access_token: 'TEST_ACCESS_TOKEN'
    })
})

interface IssuerOptions {
  issuer?: string
  authorization_endpoint?: string
  token_endpoint?: string
}

interface ClientOptions {
  client_id?: string
  client_secret?: string
  redirect_uri?: string
}

describe('clientCredentialsCodeGrant', () => {
  it('should not do anything if req.session.tokenSet is already set', async () => {
    const mockRequest = {
      session: {
        tokenSet: {
          token_type: 'bearer',
          access_token: 'TEST-ACCESS-TOKEN'
        }
      }
    } as unknown as express.Request;
    const mockResponse = {
    } as unknown as express.Response
    await clientCredentialsGrant({}, mockRequest, mockResponse, () => { })
    expect(mockRequest.session.tokenSet).toEqual({ token_type: 'bearer', access_token: 'TEST-ACCESS-TOKEN' })
  })
})

describe('authorizationRequest', () => {
  it('returns a authorization request url.', () => {
    const client = Client({}, {});
    const url = authorizationRequest(client, {
      state: 'TEST_STATE',
      code_challenge: 'TEST_CODE_CHALLENGE',
      code_challenge_method: 'S256'
    })
    expect(url).toBe('https://localhost:5555/oauth2/authorize?client_id=TEST_CLIENT_ID&scope=tweet.read%20users.read%20offline.access&response_type=code&redirect_uri=TEST_REDIRECT_URI&state=TEST_STATE&code_challenge=TEST_CODE_CHALLENGE&code_challenge_method=S256')
  })
})

describe('tokenRequest', () => {
  it('returns the tokenSet', async () => {
    const issuer: Issuer = new Issuer({
      issuer: 'https://twitter.com',
      authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
      token_endpoint: 'https://api.twitter.com/2/oauth2/token'
    })
    const client: BaseClient = new issuer.Client({
      client_id: 'TEST_CLIENT_ID',
      client_secret: 'TEST_CLIENT_SECRET',
      redirect_uris: ['TEST_REDIRECT_URI'],
    });
    const mockRequest = {
      method: 'GET',
      url: 'http://localhost/cb?code=TEST_CODE&state=TEST_STATE',
    } as unknown as express.Request;
    const tokenSet = await tokenRequest(mockRequest, client, {
      client_id: 'TEST_CLIENT_ID',
      state: 'TEST_STATE',
      code_verifier: 'TEST_CODE_VERIFIER',
      redirect_uri: 'TEST_REDIRECT_URI'
    })
    expect(tokenSet.token_type).toBe('bearer')
    expect(tokenSet.expires_at).toBe(1095379198)
    expect(tokenSet.access_token).toBe('TEST_ACCESS_TOKEN')
    expect(tokenSet.scope).toBe('TEST_SCOPE')
    expect(tokenSet.refresh_token).toBe('TEST_REFRESH_TOKEN')
  })
})

function Client(issuerOptions: IssuerOptions, clientOptions: ClientOptions): BaseClient {
  const issuer: Issuer = new Issuer({
    issuer: issuerOptions.issuer || 'https://localhost:5555',
    authorization_endpoint: issuerOptions.authorization_endpoint || 'https://localhost:5555/oauth2/authorize',
    token_endpoint: issuerOptions.token_endpoint || 'https://localhost/2/oauth2/token'
  });
  const client: BaseClient = new issuer.Client({
    client_id: clientOptions.client_id || 'TEST_CLIENT_ID',
    client_secret: clientOptions.client_secret || 'TEST_CLIENT_SECRET',
    redirect_uris: clientOptions.redirect_uri ? [clientOptions.redirect_uri] : ['TEST_REDIRECT_URI'],
    token_endpoint_auth_method: 'none'
  })
  return client
}