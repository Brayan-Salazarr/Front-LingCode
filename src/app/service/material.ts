import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Material {

  private apiUrl = 'http://localhost:8080/api/material/link';

  constructor(private http: HttpClient) {}

  getDownloadLink(path: string): Observable<{ downloadUrl: string }> {
    return this.http.get<{ downloadUrl: string }>(
      `${this.apiUrl}/${path}`
    );
  }
}