import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  
  private getEnvVar(key: string): string | undefined {
    return (window as any)?.env?.[key];
  }

  get baseUrl(): string {
    return this.getEnvVar('API_BASE_URL') || 'https://97mnvqtra8.execute-api.us-east-1.amazonaws.com/DEV/';
  }

  get endpoints() {
    return {
      productos: `${this.baseUrl}${this.getEnvVar('ENDPOINT_PRODUCTOS') || '/productos'}`,
      auth: `${this.baseUrl}${this.getEnvVar('ENDPOINT_AUTH') || '/auth'}`,
      users: `${this.baseUrl}${this.getEnvVar('ENDPOINT_USERS') || '/users'}`,
      base: this.baseUrl
    };
  }
} 