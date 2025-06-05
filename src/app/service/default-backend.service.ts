import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DefaultBackendService {

  private apiUrl = 'http://localhost:8080/mensaje';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  public consumirBackend() {
    const body = {
      key: 'Hola mundo'
    };

    return this.http.post(this.apiUrl, body, this.httpOptions);
  }
}