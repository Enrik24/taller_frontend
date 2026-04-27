import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { Comision } from '../../../../core/models';

@Component({
  selector: 'app-comision-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule
  ],
  template: `
    <div class="table-container mat-elevation-z8">
      <table mat-table [dataSource]="dataSource" matSort>

        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
          <td mat-cell *matCellDef="let element"> #{{element.id}} </td>
        </ng-container>

        <!-- Monto Column -->
        <ng-container matColumnDef="monto">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Monto </th>
          <td mat-cell *matCellDef="let element"> \${{element.monto | number:'1.2-2'}} </td>
        </ng-container>

        <!-- Porcentaje Column -->
        <ng-container matColumnDef="porcentaje">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Porcentaje (10%) </th>
          <td mat-cell *matCellDef="let element"> {{element.porcentaje}}% </td>
        </ng-container>

        <!-- Estado Column -->
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
          <td mat-cell *matCellDef="let element">
            <mat-chip-set>
              <mat-chip [color]="element.estado === 'Pagado' ? 'primary' : 'accent'" highlighted>
                {{element.estado}}
              </mat-chip>
            </mat-chip-set>
          </td>
        </ng-container>

        <!-- Fecha Column -->
        <ng-container matColumnDef="fecha_registro">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha </th>
          <td mat-cell *matCellDef="let element"> {{element.fecha_registro | date:'mediumDate'}} </td>
        </ng-container>

        <!-- Solicitud ID Column -->
        <ng-container matColumnDef="solicitud_id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Solicitud ID </th>
          <td mat-cell *matCellDef="let element"> #{{element.solicitud_id}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        
        <!-- Row shown when there is no matching data. -->
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell empty-cell" colspan="6">No hay comisiones para mostrar</td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
    </div>
  `,
  styles: `
    .table-container {
      width: 100%;
      overflow: auto;
      border-radius: 8px;
    }
    table {
      width: 100%;
    }
    .empty-cell {
      padding: 24px;
      text-align: center;
      color: #666;
    }
  `
})
export class ComisionTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'solicitud_id', 'monto', 'porcentaje', 'estado', 'fecha_registro'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() set comisiones(data: any[]) {
    this.dataSource.data = data || [];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
