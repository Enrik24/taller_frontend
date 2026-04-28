import { Component, Output, EventEmitter, signal, AfterViewInit, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-emergency-map',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  template: `
    <div class="map-wrapper relative">
      <div leaflet 
           [leafletOptions]="options"
           [leafletLayers]="layers"
           (leafletMapReady)="onMapReady($event)"
           class="map-container">
      </div>
      @if (errorMsg()) {
        <div class="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {{ errorMsg() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
    }
    .map-container {
      height: 400px;
      width: 100%;
      border-radius: 8px;
      z-index: 10;
    }
  `]
})
export class EmergencyMapComponent implements AfterViewInit {
  @Output() locationChanged = new EventEmitter<{lat: number, lng: number}>();
  
  location = signal<{lat: number, lng: number} | null>(null);
  errorMsg = signal<string | null>(null);
  
  options: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 18, 
        attribution: '© OpenStreetMap contributors' 
      })
    ],
    zoom: 15,
    center: L.latLng(-16.5, -68.15) // Default to an initial coordinate if geolocation fails
  };

  layers: L.Layer[] = [];

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  constructor(
    private ngZone: NgZone, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Leaflet icon fix
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          this.ngZone.run(() => {
            this.setLocation(lat, lng);
          });
        },
        (error) => {
          this.ngZone.run(() => {
            this.errorMsg.set('No se pudo obtener la ubicación. Selecciona el punto en el mapa manualmente.');
            // Allow manual set even if geolocation fails
            if (this.map) {
               this.map.on('click', (e: L.LeafletMouseEvent) => {
                 this.ngZone.run(() => {
                   this.setLocation(e.latlng.lat, e.latlng.lng);
                 });
               });
            }
          });
        }
      );
    } else {
      this.errorMsg.set('Geolocalización no soportada en este entorno.');
    }
  }

  private setLocation(lat: number, lng: number) {
    this.location.set({ lat, lng });
    this.locationChanged.emit({ lat, lng });
    
    const latLng = L.latLng(lat, lng);
    
    if (this.map) {
      this.map.setView(latLng, 15);
    }
    
    if (!this.marker) {
      this.marker = L.marker(latLng, { draggable: true });
      this.marker.on('dragend', (e) => {
        const newPos = (e.target as L.Marker).getLatLng();
        this.ngZone.run(() => {
          this.location.set({ lat: newPos.lat, lng: newPos.lng });
          this.locationChanged.emit({ lat: newPos.lat, lng: newPos.lng });
        });
      });
      // Add marker to the reactive layers array
      this.layers = [this.marker];
    } else {
      this.marker.setLatLng(latLng);
    }
  }
}
