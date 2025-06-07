import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';

@Injectable({
  providedIn: 'root'
})
export class DefaultBackendService {

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private apiClient: ApiClientService
  ) {}

  public consumirBackend() {
    const body = {
      key: 'Hola mundo'
    };

    return this.http.post(this.apiClient.endpoints.base, body, this.httpOptions);
  }

  public consumirBackendGet() {
    return this.http.get(this.apiClient.endpoints.productos, this.httpOptions);
  }
}