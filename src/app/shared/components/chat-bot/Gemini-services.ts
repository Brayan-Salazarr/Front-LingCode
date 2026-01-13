import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GeminiService {

  
  private API_KEY = 'AIzaSyBP7ViL1tLJYlC6j8KE3Q312K3Fmp4GBjE';
  private API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string) {
    const body = {
      contents: [
        {
          parts: [{ text: message }]
        }
      ]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.API_URL, body, { headers });
  }
}
