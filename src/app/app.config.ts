import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { environment } from '../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { authInterceptorProvider } from './interceptor/auth-interceptor.interceptor';

/**
 * Callback personalizado para logs del sistema MSAL.
 * 
 * Se ejecuta cada vez que MSAL genera un mensaje de log.
 * Imprime todos los mensajes en la consola.
 */
export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

/**
 * Factory function que crea una instancia de PublicClientApplication de MSAL.
 * 
 * Esta instancia es esencial para manejar la autenticación con Azure AD.
 * - Define el clientId y authority del registro de aplicación en Azure.
 * - Configura las URLs de redirección tras login/logout.
 * - Elige dónde guardar tokens (en este caso, LocalStorage).
 * - Configura las opciones del sistema, incluyendo logs.
 * 
 * Se provee a Angular mediante el provider MSAL_INSTANCE.
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.msalConfig.auth.authority,
      redirectUri: '/',
      postLogoutRedirectUri: '/',
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      allowNativeBroker: false,
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

/**
 * Factory function que configura el MsalInterceptor de Angular.
 * 
 * El interceptor añade automáticamente tokens a las llamadas HTTP 
 * hacia recursos protegidos por Azure AD, según el mapa de recursos.
 * - 'protectedResourceMap' define qué URLs requieren autenticación y con qué scopes.
 * - 'interactionType' define el tipo de flujo de login (Redirect).
 * 
 * Se provee a Angular mediante el provider MSAL_INTERCEPTOR_CONFIG
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(
    environment.apiConfig.uri,
    environment.apiConfig.scopes
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

/**
 * Factory function que retorna la configuración para el MsalGuard de Angular.
 * 
 * El guard protege rutas en la app y fuerza el login si el usuario no está autenticado.
 * - 'interactionType' define si el login es por redirect o popup.
 * - 'authRequest' indica los scopes a solicitar al iniciar sesión.
 * - 'loginFailedRoute' define a dónde redirigir si el login falla.
 * 
 * Se provee a Angular mediante el provider MSAL_GUARD_CONFIG.
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.apiConfig.scopes],
    },
    loginFailedRoute: '/login-failed',
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      MatButtonModule,
      MatToolbarModule,
      MatListModule,
      MatMenuModule
    ),
    provideNoopAnimations(),
    provideHttpClient(withInterceptorsFromDi(), withFetch(), withInterceptors([authInterceptorProvider])),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
};
