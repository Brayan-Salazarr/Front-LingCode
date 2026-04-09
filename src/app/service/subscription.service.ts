import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubscribeRequest {
  planCode: string;
  paymentProvider: string;
  returnUrl: string;
  customerEmail: string;
  customerFullName: string;
}

export interface SubscriptionResponse {
  id: string;
  status: string;
  checkoutUrl: string;
  plan: {
    code: string;
    name: string;
    nameEs: string;
    priceCop: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private api = environment.apiUrl + '/subscriptions';

  constructor(private http: HttpClient) {}

  subscribe(planCode: string, customerEmail: string, customerFullName: string): Observable<ApiResponse<SubscriptionResponse>> {
    const returnUrl = `${environment.appUrl}/payment-result`;

    const body: SubscribeRequest = {
      planCode,
      paymentProvider: 'WOMPI',
      returnUrl,
      customerEmail,
      customerFullName,
    };

    return this.http.post<ApiResponse<SubscriptionResponse>>(`${this.api}/subscribe`, body);
  }

  getMySubscription(): Observable<ApiResponse<SubscriptionResponse>> {
    return this.http.get<ApiResponse<SubscriptionResponse>>(`${this.api}/me`);
  }
}
