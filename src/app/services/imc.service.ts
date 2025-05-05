// imc.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ImcCategory {
  category: 'bajo' | 'normal' | 'sobrepeso' | 'obeso';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImcService {
  private imcSource = new BehaviorSubject<ImcCategory>({
    category: 'normal',
    description: 'Peso saludable'
  });
  currentImc$ = this.imcSource.asObservable();

  calculateIMC(weight: number, height: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  determineImcCategory(bmi: number): ImcCategory {
    if (bmi < 18.5) return { category: 'bajo', description: 'Bajo peso' };
    if (bmi < 25) return { category: 'normal', description: 'Peso saludable' };
    if (bmi < 30) return { category: 'sobrepeso', description: 'Sobrepeso' };
    return { category: 'obeso', description: 'Obesidad' };
  }

  updateImcCategory(weight: number, height: number): void {
    const bmi = this.calculateIMC(weight, height);
    this.imcSource.next(this.determineImcCategory(bmi));
  }
}