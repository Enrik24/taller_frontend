import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Vehiculo } from '../../../../core/models';

@Component({
  selector: 'app-vehicle-selector',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
  template: `
    @if (vehicles && vehicles.length > 0) {
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Selecciona un vehículo</mat-label>
        <mat-select [formControl]="vehicleControl" (selectionChange)="onSelect($event.value)" required>
          @for (vehiculo of vehicles; track vehiculo.id) {
            <mat-option [value]="vehiculo">
              {{ vehiculo.marca }} {{ vehiculo.modelo }} - {{ vehiculo.placa }}
            </mat-option>
          }
        </mat-select>
        @if (vehicleControl.hasError('required')) {
          <mat-error>El vehículo es requerido</mat-error>
        }
      </mat-form-field>
    } @else {
      <div class="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-4 shadow-sm border border-yellow-200">
        <p class="font-medium text-base mb-1">No tienes vehículos registrados.</p>
        <p class="text-sm">Ve a tu perfil para agregar uno antes de reportar una emergencia.</p>
      </div>
    }
  `
})
export class VehicleSelectorComponent {
  @Input() vehicles: Vehiculo[] = [];
  @Output() vehicleSelected = new EventEmitter<Vehiculo>();

  vehicleControl = new FormControl<Vehiculo | null>(null, Validators.required);

  onSelect(vehiculo: Vehiculo) {
    this.vehicleSelected.emit(vehiculo);
  }
}
