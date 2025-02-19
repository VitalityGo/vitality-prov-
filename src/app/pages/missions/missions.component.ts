import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImcService } from '../../services/imc.service'; // Importar el servicio

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
  imc: 'bajo' | 'medio' | 'alto' = 'medio'; // Valor por defecto
  dailyMissions: Mission[] = [];
  weeklyMissions: Mission[] = [];
  especialMissions: Mission[] = [];

  constructor(private imcService: ImcService) {}

  ngOnInit(): void {
    this.imcService.currentImc.subscribe(imc => {
      this.imc = imc;
      this.updateMissions(); // Actualizar las misiones cada vez que el IMC cambia
    });
  }

  ngAfterViewInit() {
    this.initializeMap(); // Inicializar el mapa al cargar la vista
  }

  initializeMap(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Ubicación del usuario
          const userLngLat = new mapboxgl.LngLat(
            position.coords.longitude,
            position.coords.latitude
          );

          this.userLocation = userLngLat;

          // Inicializa el mapa y establece el centro en la ubicación del usuario
          this.map = new mapboxgl.Map({
            container: 'map', // El ID del contenedor en el HTML
            style: 'mapbox://styles/mapbox/streets-v11', // Estilo de Mapbox
            center: [userLngLat.lng, userLngLat.lat], // Establecer centro en la ubicación actual
            zoom: 14, // Ajuste de zoom, puedes modificarlo según sea necesario
            accessToken: 'pk.eyJ1Ijoidml0YWxpdHlnbyIsImEiOiJjbTdjY3NsbDgwZXRzMmtxNzFqOHNpNHliIn0.du6tpdCZjbKh5H_JxCQsjw' // Tu token de Mapbox
          });

          // Añadir un marcador en la ubicación del usuario
          new mapboxgl.Marker()
            .setLngLat([userLngLat.lng, userLngLat.lat])
            .addTo(this.map);
        },
        (error) => {
          console.error('Error al obtener la ubicación: ', error);
        }
      );
    }
  }

  trackUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const userLngLat = new mapboxgl.LngLat(
          position.coords.longitude,
          position.coords.latitude
        );
        
        // Actualizar la ubicación del marcador y centro del mapa
        if (this.map && this.userLocation) {
          this.userLocation = userLngLat;
          this.map.setCenter([userLngLat.lng, userLngLat.lat]); // Actualizar la posición del mapa
          
          // Actualizar el marcador
          new mapboxgl.Marker()
            .setLngLat([userLngLat.lng, userLngLat.lat])
            .addTo(this.map);
        }
      });
    }
  }

  updateMissions(): void {
    if (this.imc === 'bajo') {
      this.dailyMissions = [
        { title: 'Caminar 2 km', completed: false },
        { title: 'Tomar 1.5 L de agua', completed: false },
        { title: 'Realizar estiramientos', completed: false }
      ];

      this.weeklyMissions = [
        { title: 'Caminar 5 Km', completed: false },
        { title: 'Tomar 7 L de agua', completed: false },
        { title: 'Completar todas las misiones', completed: false }
      ];

      this.especialMissions = [
        { title: 'Caminar 20 Km', completed: false },
        { title: 'Tomar 15 L de agua', completed: false },
        { title: 'Realizar un recorrido de 30 minutos de movilidad', completed: false }
      ];
    } else if (this.imc === 'medio') {
      this.dailyMissions = [
        { title: 'Correr 2 km', completed: false },
        { title: 'Tomar 2 L de agua', completed: false },
        { title: 'Realizar ejercicios de fuerza', completed: false }
      ];

      this.weeklyMissions = [
        { title: 'Correr 10 Km', completed: false },
        { title: 'Tomar 10 L de agua', completed: false },
        { title: 'Completar todas las misiones', completed: false }
      ];

      this.especialMissions = [
        { title: 'Correr 50 Km', completed: false },
        { title: 'Tomar 20 L de agua', completed: false },
        { title: 'Movilízate del punto A hasta el punto B', completed: false }
      ];
    } else if (this.imc === 'alto') {
      this.dailyMissions = [
        { title: 'Correr 3 km', completed: false },
        { title: 'Tomar 3 L de agua', completed: false },
        { title: 'Realizar entrenamientos intensos', completed: false }
      ];

      this.weeklyMissions = [
        { title: 'Correr 15 Km', completed: false },
        { title: 'Tomar 15 L de agua', completed: false },
        { title: 'Completar todas las misiones', completed: false }
      ];

      this.especialMissions = [
        { title: 'Correr 60 Km', completed: false },
        { title: 'Tomar 25 L de agua', completed: false },
        { title: 'Realizar un desafío físico de alta intensidad', completed: false }
      ];
    }
  }
}
