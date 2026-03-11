import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnergyService {
  
  private energySubject = new BehaviorSubject<number>(20);
  energy$ = this.energySubject.asObservable();

  getEnergy(){
    return this.energySubject.value;
  }

  useEnergy(){
    const current = this.energySubject.value;

    if(current > 0){
      this.energySubject.next(current - 1)
    }
  }

  addEnergy(amount: number){
    this.energySubject.next(this.energySubject.value + amount);
  }
}
