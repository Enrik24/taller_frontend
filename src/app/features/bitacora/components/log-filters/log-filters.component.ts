import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime } from 'rxjs/operators';

export interface LogFilters {
  fecha_desde: Date | null;
  fecha_hasta: Date | null;
  entidad_afectada: string | null;
  accion: string | null;
  id_usuario: string | null;
}

@Component({
  selector: 'app-log-filters',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule
  ],
  template: `
    <form [formGroup]="filterForm" (ngSubmit)="applyFilters()" class="filter-form">
      <div class="filters-grid">
        <!-- Rango de Fechas -->
        <mat-form-field appearance="outline" class="filter-field date-range">
          <mat-label>Rango de Fechas</mat-label>
          <mat-date-range-input [rangePicker]="picker">
            <input matStartDate formControlName="fecha_desde" placeholder="Inicio">
            <input matEndDate formControlName="fecha_hasta" placeholder="Fin">
          </mat-date-range-input>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>
          <mat-error *ngIf="filterForm.errors?.['dateRangeInvalid']">
            La fecha fin debe ser mayor o igual a la de inicio
          </mat-error>
        </mat-form-field>

        <!-- Entidad -->
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Entidad Afectada</mat-label>
          <mat-select formControlName="entidad_afectada">
            <mat-option [value]="null">Todas</mat-option>
            <mat-option value="Usuario">Usuario</mat-option>
            <mat-option value="Rol">Rol</mat-option>
            <mat-option value="Pago">Pago</mat-option>
            <mat-option value="Solicitud">Solicitud</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Acción -->
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Acción</mat-label>
          <mat-select formControlName="accion">
            <mat-option [value]="null">Todas</mat-option>
            <mat-option value="LOGIN_EXITOSO">Login</mat-option>
            <mat-option value="USUARIO_CREADO">Usuario Creado</mat-option>
            <mat-option value="USUARIO_ACTUALIZADO">Usuario Actualizado</mat-option>
            <mat-option value="USUARIO_ROL_ACTUALIZADO">Rol Actualizado</mat-option>
            <mat-option value="PAGO_REALIZADO">Pago Realizado</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Usuario -->
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>ID Usuario</mat-label>
          <input matInput formControlName="id_usuario" placeholder="Ej. 123">
        </mat-form-field>
        
        <!-- Acciones de Formulario -->
        <div class="actions">
          <button type="button" mat-stroked-button color="warn" (click)="clearFilters()">
            Limpiar Filtros
          </button>
          <button type="submit" mat-flat-button color="primary">
            Aplicar
          </button>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .filter-form {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin-bottom: 24px;
    }
    .filters-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }
    .filter-field {
      flex: 1 1 200px;
    }
    .date-range {
      flex: 1 1 300px;
    }
    .actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 8px;
    }
  `]
})
export class LogFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<LogFilters>();

  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      fecha_desde: [null],
      fecha_hasta: [null],
      entidad_afectada: [null],
      accion: [null],
      id_usuario: [null]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit() {
    this.filterForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      // Optional: auto-apply when typing/changing
    });
  }

  dateRangeValidator(group: FormGroup) {
    const start = group.get('fecha_desde')?.value;
    const end = group.get('fecha_hasta')?.value;
    if (start && end && start > end) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  applyFilters() {
    if (this.filterForm.valid) {
      this.filtersChanged.emit(this.filterForm.value);
    }
  }

  clearFilters() {
    this.filterForm.reset();
    this.applyFilters();
  }
}
