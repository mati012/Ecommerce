import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  MsalService,
  MsalModule,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
  EventMessage,
  EventType,
} from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MsalModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatBadgeModule,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TiendaApp - Ecommerce Moderno';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) { }

  ngOnInit(): void {

    /**
     * Inicia el manejo de redirección de MSAL para capturar el resultado del login
     * Esto es necesario para que la aplicación pueda manejar correctamente el flujo de autenticación
     */
    this.authService.handleRedirectObservable().subscribe();
    this.isIframe = window !== window.parent && !window.opener;

    /**
     * Configura el estado de inicio de sesión al cargar la aplicación
     * Esto asegura que la UI refleje correctamente si el usuario está autenticado o no
     */
    this.setLoginDisplay();

    /**
     * Habilita los eventos de almacenamiento de cuenta para sincronizar el estado de la sesión
     * entre diferentes pestañas del navegador. Esto es útil para mantener la UI actualizada
     * sin necesidad de recargar la página.
     */
    this.authService.instance.enableAccountStorageEvents();

    /**
     * Sincroniza el estado de la sesión entre pestañas y asegura que si un usuario hace logout en otra ventana, 
     * la aplicación se actualiza correctamente. Permite reaccionar a cambios de cuentas 
     * y actualizar la UI sin tener que recargar la página completa
     */
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.ACCOUNT_ADDED ||
            msg.eventType === EventType.ACCOUNT_REMOVED
        )
      )
      .subscribe((result: EventMessage) => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = '/';
        } else {
          this.setLoginDisplay();
        }
      });

    /**
     * Permite refrescar la UI y el estado de la cuenta solo cuando todas las interacciones han terminado,
     * evitando mostrar datos inconsistentes mientras hay logins/logouts en proceso.
     * Garantiza que la experiencia de usuario sea consistente y reactiva
     */
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  checkAndSetActiveAccount() {

    // Verifica si ya hay una cuenta activa
    let activeAccount = this.authService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  /**
   * Inicia el proceso de login utilizando redirección
   * Si se proporciona una solicitud de autenticación, la utiliza; de lo contrario, usa la configuración por defecto
   */
  loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  /**
   * Inicia el proceso de login utilizando un popup
   * Si se proporciona una solicitud de autenticación, la utiliza; de lo contrario, usa la configuración por defecto
   */
  loginPopup() {
    if (this.msalGuardConfig.authRequest) {
      this.authService
        .loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);

          // Obtener y guardar el token de acceso
          this.authService.acquireTokenSilent({ scopes: ['User.Read'] }).subscribe({
            next: (tokenResponse) => {
              localStorage.setItem('jwt', tokenResponse.idToken); // Guarda el token en el localStorage
              console.log('ID token guardado en localStorage:', tokenResponse.idToken);
            },
            error: (error) => {
              console.error('Error obteniendo el token de acceso:', error);
            },
          });
        });
    } else {
      this.authService
        .loginPopup()
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);

          // Obtener y guardar el token de acceso
          this.authService.acquireTokenSilent({ scopes: ['User.Read'] }).subscribe({
            next: (tokenResponse) => {
              localStorage.setItem('jwt', tokenResponse.accessToken);
              console.log('ID token guardado en localStorage:', tokenResponse.accessToken);
            },
            error: (error) => {
              console.error('Error obteniendo el token de acceso:', error);
            },
          });
        });
    }
  }

  /**
   * Cierra la sesión del usuario
   * Si se proporciona el parámetro `popup`, utiliza el método de cierre de sesión en popup; de lo contrario, redirige al usuario
   */
  logout(popup?: boolean) {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: '/',
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  /**
   * Método que se ejecuta cuando el componente se destruye
   * Utiliza un Subject para emitir un valor y completar el observable, asegurando que no haya fugas de memoria
   */
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
