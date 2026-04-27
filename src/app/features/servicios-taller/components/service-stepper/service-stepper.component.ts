import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-service-stepper',
  standalone: true,
  imports: [CommonModule, MatStepperModule, MatButtonModule, MatIconModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper-container">
      <mat-stepper orientation="vertical" [linear]="true" [selectedIndex]="selectedIndex()" #stepper>
        @for (estado of estados; track estado; let i = $index) {
          <mat-step [completed]="isCompleted(estado, i)">
            <ng-template matStepLabel>
              <div class="step-label">
                <mat-icon>{{ getIconForState(estado) }}</mat-icon>
                <span>{{ estado }}</span>
              </div>
            </ng-template>
            
            <div class="step-content">
              <p class="state-description">{{ getDescriptionForState(estado) }}</p>
              
              @if (currentEstado === estado && estado !== 'Finalizado') {
                <div class="step-actions">
                  <button mat-raised-button color="primary" (click)="advanceToNextState(i)">
                    Avanzar a {{ estados[i + 1] }}
                  </button>
                </div>
              }
            </div>
          </mat-step>
        }
      </mat-stepper>
    </div>
  `,
  styles: [`
    .stepper-container {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
    }
    
    .step-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    
    .step-content {
      padding: 16px 0;
    }
    
    .state-description {
      color: #555;
      margin-bottom: 16px;
    }
    
    .step-actions {
      margin-top: 16px;
    }
  `]
})
export class ServiceStepperComponent {
  @Input({ required: true }) solicitudId!: number;
  
  _currentEstado: string = 'Pendiente';
  @Input() set currentEstado(val: string) {
    this._currentEstado = val;
    const index = this.getIndex(val);
    if (index !== -1) {
      this.selectedIndex.set(index);
    }
  }
  get currentEstado(): string {
    return this._currentEstado;
  }

  @Output() stateChanged = new EventEmitter<string>();

  estados = ['Pendiente', 'En camino', 'En sitio', 'Reparando', 'Finalizado'];
  selectedIndex = signal(0);

  constructor(private dialog: MatDialog) {}

  getIndex(estado: string): number {
    return this.estados.indexOf(estado);
  }

  isCompleted(estado: string, index: number): boolean {
    return this.getIndex(this.currentEstado) >= index;
  }

  getIconForState(estado: string): string {
    const icons: Record<string, string> = {
      'Pendiente': 'schedule',
      'En camino': 'directions_car',
      'En sitio': 'location_on',
      'Reparando': 'build',
      'Finalizado': 'check_circle'
    };
    return icons[estado] || 'help';
  }

  getDescriptionForState(estado: string): string {
    const desc: Record<string, string> = {
      'Pendiente': 'La solicitud ha sido recibida y está a la espera de atención.',
      'En camino': 'El técnico se dirige hacia la ubicación del cliente.',
      'En sitio': 'El técnico ha llegado al lugar de la emergencia.',
      'Reparando': 'El vehículo está siendo reparado.',
      'Finalizado': 'El servicio ha concluido satisfactoriamente.'
    };
    return desc[estado] || '';
  }

  advanceToNextState(currentIndex: number): void {
    if (currentIndex >= this.estados.length - 1) return;
    
    const nextState = this.estados[currentIndex + 1];
    
    if (nextState === 'Finalizado') {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Finalizar Servicio',
          message: '¿Está seguro de que desea marcar este servicio como Finalizado? Esta acción no se puede deshacer.',
          confirmText: 'Sí, finalizar'
        }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.updateEstado(nextState);
        }
      });
    } else {
      this.updateEstado(nextState);
    }
  }

  private updateEstado(nuevoEstado: string): void {
    this.currentEstado = nuevoEstado;
    this.stateChanged.emit(nuevoEstado);
  }
}
