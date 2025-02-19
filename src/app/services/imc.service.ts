import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImcService {
  private imcSource = new BehaviorSubject<'bajo' | 'medio' | 'alto'>('medio'); // Valor por defecto
  currentImc = this.imcSource.asObservable();

  constructor() { }

  // Cambiar el IMC
  changeImc(imc: 'bajo' | 'medio' | 'alto'): void {
    this.imcSource.next(imc);
  }
}
