import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImcService } from '../../services/imc.service';

interface Mission {
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.css']
})
export class MissionsComponent implements OnInit, AfterViewInit {
  map: mapboxgl.Map | undefined;
  userLocation: mapboxgl.LngLat | undefined;
  marker: mapboxgl.Marker | undefined;
  imcValue: 'bajo' | 'medio' | 'alto' = 'medio'; // Cambiado a tipo de cadena
  dailyMissions: Mission[] = [];
  weeklyMissions: Mission[] = [];
  especialMissions: Mission[] = [];

  constructor(private imcService: ImcService) {}

  ngOnInit(): void {
    this.imcService.currentImc.subscribe(imc => {
      this.imcValue = imc;
      this.updateMissions(); // Cargar misiones según IMC en formato cadena
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lngLat = new mapboxgl.LngLat(position.coords.longitude, position.coords.latitude);
          this.userLocation = lngLat;

          this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lngLat.lng, lngLat.lat],
            zoom: 15,
            accessToken: 'pk.eyJ1Ijoidml0YWxpdHlnbyIsImEiOiJjbTdjY3NsbDgwZXRzMmtxNzFqOHNpNHliIn0.du6tpdCZjbKh5H_JxCQsjw'
          });

          this.marker = new mapboxgl.Marker()
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(this.map);

          this.trackUserLocation();
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
        }
      );
    }
  }

  trackUserLocation(): void {
    if (navigator.geolocation && this.map) {
      navigator.geolocation.watchPosition(
        (position) => {
          const lngLat = new mapboxgl.LngLat(position.coords.longitude, position.coords.latitude);
          this.userLocation = lngLat;

          this.map!.setCenter([lngLat.lng, lngLat.lat]);

          if (this.marker) {
            this.marker.setLngLat([lngLat.lng, lngLat.lat]);
          }
        },
        (error) => {
          console.error('Error en el seguimiento:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000
        }
      );
    }
  }

  updateMissions(): void {
    const imc = this.imcValue;

    if (imc === 'bajo') {
      this.dailyMissions = [
        { title: 'Caminar 500 m lentamente', completed: false },
        { title: 'Beber 1 L de agua', completed: false },
        { title: 'Realizar estiramientos suaves', completed: false }
      ];
      this.weeklyMissions = [
        { title: 'Caminar 3 Km esta semana', completed: false },
        { title: 'Beber 5 L de agua esta semana', completed: false },
        { title: 'Asistir a 1 clase de movilidad', completed: false }
      ];
      this.especialMissions = [
        { title: 'Realizar caminata de 10 Km en 1 semana', completed: false },
        { title: 'Lograr hidratación total de 10 L', completed: false },
        { title: 'Sesión de movilidad guiada completa', completed: false }
      ];
    } else if (imc === 'medio') {
      this.dailyMissions = [
        { title: 'Caminar 2 Km', completed: false },
        { title: 'Beber 1.5 L de agua', completed: false },
        { title: 'Ejercicios de cuerpo completo 10 min', completed: false }
      ];
      this.weeklyMissions = [
        { title: 'Caminar 10 Km', completed: false },
        { title: 'Hidratación de 8 L en la semana', completed: false },
        { title: '2 sesiones de entrenamiento básico', completed: false }
      ];
      this.especialMissions = [
        { title: 'Caminar 20 Km en una semana', completed: false },
        { title: 'Superar 12 L de agua en 7 días', completed: false },
        { title: 'Desafío de 3 sesiones de movilidad', completed: false }
      ];
    } else if (imc === 'alto') {
      this.dailyMissions = [
        { title: 'Correr 5 Km o más', completed: false },
        { title: 'Beber 3 L de agua', completed: false },
        { title: 'HIIT de 20 minutos', completed: false }
      ];
      this.weeklyMissions = [
        { title: 'Correr 20 Km', completed: false },
        { title: 'Beber 15 L de agua', completed: false },
        { title: '6 entrenamientos intensos', completed: false }
      ];
      this.especialMissions = [
        { title: 'Maratón personal de 40 Km en 10 días', completed: false },
        { title: 'Mantener hidratación de 25 L en 1 semana', completed: false },
        { title: 'Completar 7 sesiones HIIT + movilidad', completed: false }
      ];
    } else {
      this.dailyMissions = [
        { title: 'Consulta médica recomendada', completed: false },
        { title: 'Hidratación controlada', completed: false },
        { title: 'Actividades de bajo impacto', completed: false }
      ];
      this.weeklyMissions = [];
      this.especialMissions = [];
    }
  }
}
