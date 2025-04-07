// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import Chart from 'chart.js/auto';  // Añade esta línea

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

  