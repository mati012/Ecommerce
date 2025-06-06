import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DefaultBackendService {

  private apiUrl = 'https://97mnvqtra8.execute-api.us-east-1.amazonaws.com/DEV/';
  private apiUrlGet = 'https://97mnvqtra8.execute-api.us-east-1.amazonaws.com/DEV/productos';
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

  public consumirBackendGet() {
    return this.http.get(this.apiUrlGet, this.httpOptions);
  }
}