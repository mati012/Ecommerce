import { environment } from 'src/environments/environment';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId, // Usamos el clientId desde environment
      authority: environment.msalConfig.auth.authority, // Usamos authority desde environment
      redirectUri: 'http://localhost:4200', // Este valor puedes mantenerlo fijo o configurarlo también en environment
    },
  });
}
