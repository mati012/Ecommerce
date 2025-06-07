import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
} from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { DefaultBackendService } from '../service/default-backend.service';
import { LucideAngularModule, ShoppingBag, Package, Shield, Zap, Heart, Users } from 'lucide-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  productos: any[] = [];
  
  // Lucide icons
  readonly ShoppingBag = ShoppingBag;
  readonly Package = Package;
  readonly Shield = Shield;
  readonly Zap = Zap;
  readonly Heart = Heart;
  readonly Users = Users;
  
  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private backendService: DefaultBackendService
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

  obtenerProductos(): void {
    this.backendService.consumirBackendGet().subscribe({
      next: (response: any) => {
        this.productos = response;
        console.log('Productos:', this.productos);
      },
      error: (error: any) => {
        console.error('Error al obtener productos:', error);
      }
    });
  }
  
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }
}
