import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BitacoraEntry } from '../../../../core/models';
import { format } from 'date-fns';

@Component({
  selector: 'app-log-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule],
  template: `
    <div class="table-container mat-elevation-z8">
      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div class="table-responsive">
        <table mat-table [dataSource]="dataSource" matSort>
          
          <!-- Fecha Hora Column -->
          <ng-container matColumnDef="fecha_hora">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha y Hora </th>
            <td mat-cell *matCellDef="let element"> {{ formatDateString(element.fecha_hora) }} </td>
          </ng-container>

          <!-- Usuario Column -->
          <ng-container matColumnDef="usuario">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Usuario </th>
            <td mat-cell *matCellDef="let element"> {{ element.usuario || 'Sistema' }} </td>
          </ng-container>

          <!-- Accion Column -->
          <ng-container matColumnDef="accion">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Acción </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="badge" [ngClass]="element.accion.toLowerCase()">{{ element.accion }}</span>
            </td>
          </ng-container>

          <!-- Entidad Column -->
          <ng-container matColumnDef="entidad_afectada">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Entidad </th>
            <td mat-cell *matCellDef="let element"> {{ element.entidad_afectada || 'N/A' }} </td>
          </ng-container>

          <!-- IP Column -->
          <ng-container matColumnDef="ip_origen">
            <th mat-header-cell *matHeaderCellDef> IP </th>
            <td mat-cell *matCellDef="let element"> {{ element.ip_origen || '-' }} </td>
          </ng-container>


          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="row-hover"></tr>
          
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-state" colspan="6">
              No hay registros que coincidan con los filtros.
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator 
        [length]="totalRecords"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 25, 50, 100]" 
        (page)="onPageChange($event)"
        showFirstLastButtons 
        aria-label="Seleccionar pagina de bitacora">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      position: relative;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      min-height: 400px;
    }
    table { width: 100%; }
    th.mat-header-cell {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
    }
    .row-hover {
      transition: background-color 0.2s;
    }
    .row-hover:hover {
      background-color: #f1f5f9;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: #e2e8f0;
      color: #475569;
    }
    .badge.create { background: #dcfce7; color: #166534; }
    .badge.read { background: #e0f2fe; color: #0369a1; }
    .badge.update { background: #fef08a; color: #854d0e; }
    .badge.delete { background: #fee2e2; color: #991b1b; }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }
  `]
})
export class LogTableComponent implements OnChanges {
  @Input() data: BitacoraEntry[] = [];
  @Input() loading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 25;
  
  @Output() pageChange = new EventEmitter<PageEvent>();

  displayedColumns: string[] = ['fecha_hora', 'usuario', 'accion', 'entidad_afectada', 'ip_origen'];
  dataSource = new MatTableDataSource<BitacoraEntry>([]);

  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  formatDateString(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm:ss');
    } catch {
      return dateStr;
    }
  }

  truncate(text: string | undefined, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
