import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { EmergencyMapComponent } from '../components/emergency-map/emergency-map.component';
import { VehicleSelectorComponent } from '../components/vehicle-selector/vehicle-selector.component';
import { FileUploaderComponent } from '../components/file-uploader/file-uploader.component';

// Services and Models
import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';
import { Vehiculo } from '../../../core/models';

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmergencyMapComponent,
    VehicleSelectorComponent,
    FileUploaderComponent
  ],
  template: `
    <div class="reportar-container w-full max-w-4xl mx-auto p-4 py-8">
      <mat-card class="shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div class="bg-red-600 text-white p-6">
          <h2 class="text-2xl font-bold m-0 flex items-center">
            <mat-icon class="mr-3 scale-110">warning</mat-icon>
            Reportar Emergencia
          </h2>
          <p class="mt-2 text-red-100 mb-0">Comida rápida, segura y confiable. Te enviaremos ayuda pronto.</p>
        </div>

        <mat-card-content class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
            
            <!-- Vehículo -->
            <section>
              <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                <span class="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">1</span>
                Vehículo Afectado
              </h3>
              <app-vehicle-selector 
                [vehicles]="vehicles()" 
                (vehicleSelected)="onVehicleSelected($event)">
              </app-vehicle-selector>
            </section>
            
            <!-- Ubicación -->
            <section>
              <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                <span class="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">2</span>
                Ubicación Actual
              </h3>
              <p class="text-sm text-gray-500 mb-3">Tu ubicación se detectará automáticamente. También puedes mover el marcador en el mapa.</p>
              <app-emergency-map (locationChanged)="onLocationChanged($event)"></app-emergency-map>
              
              <div *ngIf="form.get('latitud')?.invalid && form.get('latitud')?.touched" class="text-red-500 text-sm mt-2">
                La ubicación es requerida. Asegúrate de permitir el acceso a tu ubicación o seleccionar un punto en el mapa.
              </div>
            </section>
            
            <!-- Detalles -->
            <section>
              <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                <span class="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">3</span>
                Detalles del Problema
              </h3>
              
              <div class="grid grid-cols-1 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Tipo de Problema</mat-label>
                  <mat-select formControlName="tipo_problema">
                    <mat-option value="Mecánico">Falla Mecánica</mat-option>
                    <mat-option value="Eléctrico">Falla Eléctrica</mat-option>
                    <mat-option value="Ponchadura">Neumático / Ponchadura</mat-option>
                    <mat-option value="Accidente">Accidente / Choque</mat-option>
                    <mat-option value="Batería">Batería descargada</mat-option>
                    <mat-option value="Llaves">Llaves dentro / Problema cerradura</mat-option>
                    <mat-option value="Combustible">Falta de Combustible</mat-option>
                    <mat-option value="Otro">Otro Problema</mat-option>
                  </mat-select>
                  <mat-error *ngIf="form.get('tipo_problema')?.hasError('required')">Requerido</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Descripción / Observaciones</mat-label>
                  <textarea matInput formControlName="descripcion_texto" rows="4" placeholder="Describe lo ocurrido lo más claro posible..."></textarea>
                  <mat-error *ngIf="form.get('descripcion_texto')?.hasError('required')">La descripción es obligatoria</mat-error>
                  <mat-error *ngIf="form.get('descripcion_texto')?.hasError('minlength')">Mínimo 20 caracteres son necesarios para explicar adecuadamente</mat-error>
                </mat-form-field>
              </div>
            </section>
            
            <!-- Evidencias -->
            <section>
              <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                <span class="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">4</span>
                Fotografías y Audios (Opcional)
              </h3>
              <p class="text-sm text-gray-500 mb-3">Sube imágenes del vehículo y el entorno, o un audio explicando el problema para ayudar a los mecánicos a entender la situación.</p>
              <app-file-uploader (filesUploaded)="onFilesSelected($event)"></app-file-uploader>
            </section>
            
            <div class="mt-6 flex justify-end">
              <button mat-raised-button 
                      color="warn" 
                      type="submit" 
                      class="px-8 py-6 text-lg font-bold disabled:bg-gray-300 disabled:text-gray-500"
                      [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="24" color="accent" class="inline-block mr-2"></mat-spinner>
                  Enviando...
                } @else {
                  <ng-container>
                    <mat-icon>campaign</mat-icon>
                    Enviar Emergencia
                  </ng-container>
                }
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ReportarComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastNotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    vehiculoId: new FormControl<number | null>(null, [Validators.required]),
    latitud: new FormControl<number | null>(null, [Validators.required]),
    longitud: new FormControl<number | null>(null, [Validators.required]),
    descripcion_texto: new FormControl<string>('', [Validators.required, Validators.minLength(20)]),
    tipo_problema: new FormControl<string>('', [Validators.required]),
    archivos: new FormControl<File[] | null>(null)
  });

  vehicles = signal<Vehiculo[]>([]);
  loading = signal<boolean>(false);
  mapLocation = signal<{lat: number, lng: number} | null>(null);

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles() {
    this.apiService.get<Vehiculo[]>('/api/perfil/vehiculos').subscribe({
      next: (data) => {
        this.vehicles.set(data || []);
      },
      error: (err) => {
        console.error('Error al cargar vehículos', err);
        this.toast.error('No se pudieron cargar tus vehículos');
      }
    });
  }

  onVehicleSelected(vehicle: Vehiculo) {
    this.form.patchValue({ vehiculoId: vehicle.id });
  }

  onLocationChanged(location: {lat: number, lng: number}) {
    this.mapLocation.set(location);
    this.form.patchValue({ 
      latitud: location.lat, 
      longitud: location.lng 
    });
    // Mark as touched and update validity to trigger validation correctly
    this.form.controls.latitud.markAsTouched();
    this.form.controls.latitud.updateValueAndValidity();
    this.form.controls.longitud.markAsTouched();
    this.form.controls.longitud.updateValueAndValidity();
  }

  onFilesSelected(files: File[]) {
    this.form.patchValue({ archivos: files.length > 0 ? files : null });
  }

  onSubmit() {
    // Mark all fields to trigger UI errors
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.error('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }

    this.loading.set(true);
    const formData = new FormData();
    const fv = this.form.value;

    formData.append('vehiculoId', fv.vehiculoId?.toString() || '');
    formData.append('latitud', fv.latitud?.toString() || '');
    formData.append('longitud', fv.longitud?.toString() || '');
    formData.append('descripcion_texto', fv.descripcion_texto || '');
    formData.append('tipo_problema', fv.tipo_problema || '');

    if (fv.archivos && fv.archivos.length > 0) {
      for (const file of fv.archivos) {
        formData.append('archivos', file);
      }
    }

    const headers = { 'Accept': 'application/json' };
    // Let browser set the correct multipart/form-data boundary

    this.apiService.post<any>('/api/solicitudes/', formData).subscribe({
      next: () => {
        this.toast.success('Emergencia reportada de forma exitosa. Un taller será asignado a la brevedad.');
        this.router.navigate(['/emergencias/mis-solicitudes']);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error enviando solicitud', err);
        this.toast.error('Ocurrió un error al enviar el reporte. Por favor intente nuevamente.');
        this.loading.set(false);
      }
    });
  }
}
