import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnergyService {

  private MAX_ENERGY = 20;
  private REGEN_TIME = 20 * 60 * 100; // 20 minutos

  private energySubject = new BehaviorSubject<number>(this.loadEnergy());
  energy$ = this.energySubject.asObservable();

  private lastEnergyTimeKey = 'lastEnergyTime';
  private remainingTimeSubject = new BehaviorSubject<number>(0);
  remainingTime$ = this.remainingTimeSubject.asObservable();

  constructor() {
     setInterval(() => {

    const energy = this.loadEnergy(); // 🔥 recalcula SIEMPRE
    this.energySubject.next(energy);

    this.updateRemainingTime();

  }, 1000);
  }

  // Obtener energía actual
  getEnergy() {
    return this.energySubject.value;
  }

  // Saber si puede jugar
  canPlay(): boolean {
    return this.getEnergy() > 0;
  }

  private updateRemainingTime() {

    
  const lastTime = localStorage.getItem(this.lastEnergyTimeKey);

  if (!lastTime) {
    this.remainingTimeSubject.next(0);
    return;
  }

  const now = Date.now();
  const diff = now - +lastTime;

  const remaining = this.REGEN_TIME - (diff % this.REGEN_TIME);

  this.remainingTimeSubject.next(remaining);
  }

  // Usar energía
  useEnergy(): boolean {
    const current = this.getEnergy();

    if (current <= 0) return false;

    const newEnergy = current - 1;
    this.energySubject.next(newEnergy);
    this.saveEnergy(newEnergy);
    localStorage.setItem(this.lastEnergyTimeKey, Date.now().toString());

    return true;
  }


  // Guardar en localStorage
  private saveEnergy(energy: number) {
    localStorage.setItem('energy', energy.toString());
  }

  // Cargar energía
  private loadEnergy(): number {

  const stored = localStorage.getItem('energy');
  const savedEnergy = stored !== null ? +stored : this.MAX_ENERGY;
  const lastTime = +localStorage.getItem(this.lastEnergyTimeKey)!;

  if (!lastTime) return savedEnergy;

  const now = Date.now();
  const diff = now - lastTime;

  const regenerated = Math.floor(diff / this.REGEN_TIME);

  const newEnergy = Math.min(this.MAX_ENERGY, savedEnergy + regenerated);

  // 🔥 ACTUALIZA AUTOMÁTICAMENTE
  if (newEnergy !== savedEnergy) {
    localStorage.setItem('energy', newEnergy.toString());

    // 🔥 IMPORTANTE: avanzar el tiempo solo lo necesario
    const newLastTime = lastTime + (regenerated * this.REGEN_TIME);
    localStorage.setItem(this.lastEnergyTimeKey, newLastTime.toString());
  }

  return newEnergy;
}
}
