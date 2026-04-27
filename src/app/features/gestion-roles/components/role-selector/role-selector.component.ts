import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../../../core/services/api.service';
import { Rol } from '../../../../core/models';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Seleccionar Rol</mat-label>
      <mat-select [ngModel]="selectedRoleId" (ngModelChange)="onRoleChange($event)">
        <mat-option *ngFor="let rol of roles()" [value]="rol.id">
          {{ rol.nombre }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .w-full { width: 100%; min-width: 200px; }
  `]
})
export class RoleSelectorComponent implements OnInit {
  private apiService = inject(ApiService);

  @Input() selectedRoleId?: number;
  @Output() roleSelected = new EventEmitter<number>();

  roles = signal<Rol[]>([]);

  ngOnInit() {
    this.apiService.get<{data: Rol[]}>('admin/roles').subscribe({
      next: (res) => {
        // Asumiendo que retorna { data: [...] } o simplemente [...]
        const rolesData = Array.isArray(res) ? res : res.data;
        this.roles.set(rolesData || []);
      },
      error: (err) => console.error('Error cargando roles en selector', err)
    });
  }

  onRoleChange(newId: number) {
    this.selectedRoleId = newId;
    this.roleSelected.emit(newId);
  }
}
