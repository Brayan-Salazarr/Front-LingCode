import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByPlan: { [key: string]: number };
  usersByProvider: { [key: string]: number };
  activeUsersLast24h: number;
  activeUsersLast7d: number;
  activeUsersLast30d: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  blockedUsers: number;
}

const PLAN_PRICES: { [key: string]: number } = {
  FREE: 0,
  BASIC: 4.99,
  PREMIUM: 9.99,
  PRO: 19.99
};

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http
      .get<{ data: AdminStats }>(`${this.baseUrl}/stats`)
      .pipe(map(res => res.data));
  }

  estimatedMonthlyRevenue(usersByPlan: { [key: string]: number }): number {
    return Object.entries(usersByPlan).reduce((total, [plan, count]) => {
      const price = PLAN_PRICES[plan.toUpperCase()] ?? 0;
      return total + price * count;
    }, 0);
  }
}
