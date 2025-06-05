import { Component, OnInit } from '@angular/core';
import { DefaultBackendService } from '../service/default-backend.service';
import { CommonModule } from '@angular/common';


type ProfileType = {
  name?: string;
  preferred_username?: string;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule],
  styleUrls: [],
  standalone: true,
})
export class ProfileComponent implements OnInit {
  profile: ProfileType | undefined;
  responseBackend!: object;

  constructor(private backendService: DefaultBackendService) {}

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    // Obtener el token del localStorage
    const token = localStorage.getItem('jwt');
  
    if (token) {
      try {
        // Decodificar el token sin usar jwt-decode (usando la función decodeTokenBase64Url)
        const decodedToken: any = this.decodeTokenBase64Url(token);
  
        // Extraer los datos deseados
        this.profile = {
          name: decodedToken.name,
          preferred_username: decodedToken.preferred_username,
        };
  
        console.log('Perfil decodificado:', this.profile);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    } else {
      console.error('No se encontró ningún token en el localStorage.');
    }
  }
  
  private decodeTokenBase64Url(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
  llamarBackend(): void {
    this.backendService.consumirBackend().subscribe(response => {
      this.responseBackend = response;
    });
  }

  mostrarResponseBackend(): string {
    return JSON.stringify(this.responseBackend);
  }
}
