import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiClientService } from '../service/api-client.service';
import { DefaultBackendService } from '../service/default-backend.service';

interface EndpointResult {
  success: boolean;
  data: any;
  timestamp: string;
}

interface LoadingState {
  backendBase: boolean;
  productos: boolean;
  auth: boolean;
  users: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  
  // Estados de carga
  isLoading: LoadingState = {
    backendBase: false,
    productos: false,
    auth: false,
    users: false
  };

  // Resultados de las llamadas
  results: {
    backendBase?: EndpointResult;
    productos?: EndpointResult;
    auth?: EndpointResult;
    users?: EndpointResult;
  } = {};

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private apiClient: ApiClientService,
    private backendService: DefaultBackendService
  ) {}

  // Obtener endpoint URL
  getEndpoint(type: string): string {
    switch (type) {
      case 'base':
        return this.apiClient.endpoints.base;
      case 'productos':
        return this.apiClient.endpoints.productos;
      case 'auth':
        return this.apiClient.endpoints.auth;
      case 'users':
        return this.apiClient.endpoints.users;
      default:
        return '';
    }
  }

  // Verificar si tiene token
  hasToken(): boolean {
    return !!localStorage.getItem('jwt');
  }

  // Test Backend Base (POST)
  testBackendBase(): void {
    this.isLoading.backendBase = true;
    
    this.backendService.consumirBackend().subscribe({
      next: (response) => {
        this.results.backendBase = {
          success: true,
          data: response,
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.backendBase = false;
      },
      error: (error) => {
        this.results.backendBase = {
          success: false,
          data: {
            message: error.message || 'Error desconocido',
            status: error.status || 'N/A',
            statusText: error.statusText || 'Error',
            error: error.error || error
          },
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.backendBase = false;
      }
    });
  }

  // Test Productos (GET)
  testProductos(): void {
    this.isLoading.productos = true;
    
    this.backendService.consumirBackendGet().subscribe({
      next: (response) => {
        this.results.productos = {
          success: true,
          data: response,
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.productos = false;
      },
      error: (error) => {
        this.results.productos = {
          success: false,
          data: {
            message: error.message || 'Error desconocido',
            status: error.status || 'N/A',
            statusText: error.statusText || 'Error',
            error: error.error || error
          },
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.productos = false;
      }
    });
  }

  // Test Auth (GET)
  testAuth(): void {
    this.isLoading.auth = true;
    
    this.http.get(this.apiClient.endpoints.auth, this.httpOptions).subscribe({
      next: (response) => {
        this.results.auth = {
          success: true,
          data: response,
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.auth = false;
      },
      error: (error) => {
        this.results.auth = {
          success: false,
          data: {
            message: error.message || 'Error desconocido',
            status: error.status || 'N/A',
            statusText: error.statusText || 'Error',
            error: error.error || error
          },
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.auth = false;
      }
    });
  }

  // Test Users (GET)
  testUsers(): void {
    this.isLoading.users = true;
    
    this.http.get(this.apiClient.endpoints.users, this.httpOptions).subscribe({
      next: (response) => {
        this.results.users = {
          success: true,
          data: response,
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.users = false;
      },
      error: (error) => {
        this.results.users = {
          success: false,
          data: {
            message: error.message || 'Error desconocido',
            status: error.status || 'N/A',
            statusText: error.statusText || 'Error',
            error: error.error || error
          },
          timestamp: new Date().toLocaleTimeString()
        };
        this.isLoading.users = false;
      }
    });
  }

  // Verificar si hay resultados
  hasResults(): boolean {
    return Object.keys(this.results).length > 0;
  }

  // Limpiar todos los resultados
  clearResults(): void {
    this.results = {};
  }
}
