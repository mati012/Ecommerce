export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: '0eb5632d-a128-4a9b-8b7a-56cf5a656465',
      authority: 'https://login.microsoftonline.com/55d0a225-7b42-4f8b-b8c9-3ab45433ea4a', // TU TENANT REAL
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200'
    },
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
};
