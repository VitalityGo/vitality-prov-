import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Mission {
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  imports: [FormsModule, NgFor],
  styleUrls: ['./missions.component.css'],
  standalone: true
})
export class MissionsComponent {
  // Misiones diarias
  dailyMissions: Mission[] = [
    { title: 'Correr 2 km', completed: false },
    { title: 'Tomar 2 L de agua', completed: false },
    { title: 'Hacer ejercicio', completed: false }
  ];

  // Misiones semanales
  weeklyMissions: Mission[] = [
    { title: 'Correr 10 Km', completed: false },
    { title: 'Tomar 10 L de agua', completed: false },
    { title: 'Completar todas las misiones', completed: false }
  ];
  especialMissions: Mission[] = [
    { title: 'Correr 50 Km', completed: false },
    { title: 'Tomar 20 L de agua', completed: false },
    { title: 'Movilizate del punto A hasta el punto B', completed: false }
  ];
}
