import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
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
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('🚀 INICIANDO APLICACIÓN');
    console.log('📋 Configuración MSAL Guard:', this.msalGuardConfig);

    /**
     * Inicia el manejo de redirección de MSAL para capturar el resultado del login
     * Esto es necesario para que la aplicación pueda manejar correctamente el flujo de autenticación
     */
    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          console.log('✅ LOGIN REDIRECT EXITOSO');
          console.log('👤 Usuario:', result.account?.username);
          console.log('📧 Email:', result.account?.homeAccountId);
          console.log('🏢 Tenant:', result.account?.tenantId);
          console.log('🔑 ID Token:', result.idToken);
          this.logAccountInfo(result.account);
        }
      },
      error: (error) => {
        console.error('❌ ERROR EN LOGIN REDIRECT:', error);
      }
    });

    this.isIframe = window !== window.parent && !window.opener;
    console.log('🖼️ Es iframe:', this.isIframe);

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
            msg.eventType === EventType.ACCOUNT_REMOVED ||
            msg.eventType === EventType.LOGIN_SUCCESS ||
            msg.eventType === EventType.LOGIN_FAILURE ||
            msg.eventType === EventType.LOGOUT_SUCCESS
        )
      )
      .subscribe((result: EventMessage) => {
        console.log('📢 EVENTO MSAL:', result.eventType);
        
        if (result.eventType === EventType.LOGIN_SUCCESS) {
          console.log('🎉 LOGIN EXITOSO - Evento detectado');
          const payload = result.payload as AuthenticationResult;
          this.logAccountInfo(payload.account);
        }
        
        if (result.eventType === EventType.LOGIN_FAILURE) {
          console.error('💥 LOGIN FALLIDO:', result.error);
        }
        
        if (result.eventType === EventType.LOGOUT_SUCCESS) {
          console.log('👋 LOGOUT EXITOSO');
        }

        if (result.eventType === EventType.ACCOUNT_ADDED) {
          console.log('➕ CUENTA AGREGADA');
        }

        if (result.eventType === EventType.ACCOUNT_REMOVED) {
          console.log('➖ CUENTA REMOVIDA');
        }

        if (this.authService.instance.getAllAccounts().length === 0) {
          console.log('🏠 Redirigiendo al home - No hay cuentas');
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
        console.log('🔄 Interacción completada - Actualizando estado');
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });
  }

  setLoginDisplay() {
    const accounts = this.authService.instance.getAllAccounts();
    this.loginDisplay = accounts.length > 0;
    
    console.log('👥 Total de cuentas:', accounts.length);
    console.log('🔐 Login display:', this.loginDisplay);
    
    if (accounts.length > 0) {
      console.log('📊 Cuentas activas:');
      accounts.forEach((account, index) => {
        console.log(`   ${index + 1}. ${account.username} (${account.name})`);
      });
    }
  }

  checkAndSetActiveAccount() {
    // Verifica si ya hay una cuenta activa
    let activeAccount = this.authService.instance.getActiveAccount();
    console.log('🎯 Cuenta activa actual:', activeAccount?.username || 'Ninguna');

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
      console.log('✅ Nueva cuenta activa establecida:', accounts[0].username);
    }
  }

  /**
   * Función helper para mostrar información detallada de la cuenta
   */
  private logAccountInfo(account: any) {
    if (account) {
      console.log('👤 === INFORMACIÓN DE LA CUENTA ===');
      console.log('📧 Username:', account.username);
      console.log('👨‍💼 Name:', account.name);
      console.log('🆔 Account ID:', account.localAccountId);
      console.log('🏢 Tenant ID:', account.tenantId);
      console.log('🏠 Environment:', account.environment);
      console.log('📅 ID Token Claims:', account.idTokenClaims);
      console.log('===============================');
    }
  }

  /**
   * Inicia el proceso de login utilizando redirección
   * Si se proporciona una solicitud de autenticación, la utiliza; de lo contrario, usa la configuración por defecto
   */
  loginRedirect() {
    console.log('🚀 INICIANDO LOGIN REDIRECT');
    
    if (this.msalGuardConfig.authRequest) {
      console.log('📋 Usando configuración de auth request:', this.msalGuardConfig.authRequest);
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      console.log('📋 Usando configuración por defecto');
      this.authService.loginRedirect();
    }
  }

  /**
   * Inicia el proceso de login utilizando un popup
   * Si se proporciona una solicitud de autenticación, la utiliza; de lo contrario, usa la configuración por defecto
   */
  loginPopup() {
    console.log('🚀 INICIANDO LOGIN POPUP');

    if (this.msalGuardConfig.authRequest) {
      console.log('📋 Usando configuración de auth request:', this.msalGuardConfig.authRequest);
      
      this.authService
        .loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe({
          next: (response: AuthenticationResult) => {
            console.log('🎉 LOGIN POPUP EXITOSO');
            console.log('👤 Usuario logueado:', response.account?.username);
            
            this.authService.instance.setActiveAccount(response.account);
            this.logAccountInfo(response.account);

            // Obtener y guardar el token de acceso
            this.authService.acquireTokenSilent({ scopes: ['User.Read'] }).subscribe({
              next: (tokenResponse) => {
                console.log('🔑 TOKEN OBTENIDO EXITOSAMENTE');
                console.log('📝 ID Token (primeros 50 chars):', tokenResponse.idToken?.substring(0, 50) + '...');
                console.log('⏰ Expira en:', tokenResponse.expiresOn);
                console.log('🔍 Scopes:', tokenResponse.scopes);
                
                localStorage.setItem('jwt', tokenResponse.idToken); // Guarda el token en el localStorage
                console.log('💾 Token guardado en localStorage');
                
                // Redirigir al dashboard después del login exitoso
                console.log('🎯 Redirigiendo al dashboard...');
                window.location.href = '/dashboard';
              },
              error: (error) => {
                console.error('❌ ERROR obteniendo el token de acceso:', error);
              },
            });
          },
          error: (error) => {
            console.error('💥 ERROR EN LOGIN POPUP:', error);
            console.error('📄 Detalles del error:', error.message);
          }
        });
    } else {
      console.log('📋 Usando configuración por defecto');
      
      this.authService
        .loginPopup()
        .subscribe({
          next: (response: AuthenticationResult) => {
            console.log('🎉 LOGIN POPUP EXITOSO (configuración por defecto)');
            console.log('👤 Usuario logueado:', response.account?.username);
            
            this.authService.instance.setActiveAccount(response.account);
            this.logAccountInfo(response.account);

            // Obtener y guardar el token de acceso
            this.authService.acquireTokenSilent({ scopes: ['User.Read'] }).subscribe({
              next: (tokenResponse) => {
                console.log('🔑 TOKEN OBTENIDO EXITOSAMENTE');
                console.log('📝 Access Token (primeros 50 chars):', tokenResponse.accessToken?.substring(0, 50) + '...');
                console.log('⏰ Expira en:', tokenResponse.expiresOn);
                
                localStorage.setItem('jwt', tokenResponse.accessToken);
                console.log('💾 Token guardado en localStorage');
                
                // Redirigir al dashboard después del login exitoso
                console.log('🎯 Redirigiendo al dashboard...');
                window.location.href = '/dashboard';
              },
              error: (error) => {
                console.error('❌ ERROR obteniendo el token de acceso:', error);
              },
            });
          },
          error: (error) => {
            console.error('💥 ERROR EN LOGIN POPUP:', error);
            console.error('📄 Detalles del error:', error.message);
          }
        });
    }
  }

  /**
   * Cierra la sesión del usuario
   * Si se proporciona el parámetro `popup`, utiliza el método de cierre de sesión en popup; de lo contrario, redirige al usuario
   */
  logout(popup?: boolean) {
    console.log('👋 INICIANDO LOGOUT', popup ? '(popup)' : '(redirect)');
    
    // Limpiar localStorage
    const token = localStorage.getItem('jwt');
    if (token) {
      console.log('🗑️ Removiendo token del localStorage');
      console.log('🔑 Token removido (primeros 20 chars):', token.substring(0, 20) + '...');
      localStorage.removeItem('jwt');
    }
    
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: '/',
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  getCartCount(): number {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(cart)
      ? cart.reduce((sum: number, item: { cantidad: number }) => sum + item.cantidad, 0)
      : 0;
  }

  /** Navega a la vista del carrito */
  goToCart(): void {
    this.router.navigate(['/carrito']);
  }

  /**
   * Método que se ejecuta cuando el componente se destruye
   * Utiliza un Subject para emitir un valor y completar el observable, asegurando que no haya fugas de memoria
   */
  ngOnDestroy(): void {
    console.log('🛑 Destruyendo componente principal');
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
