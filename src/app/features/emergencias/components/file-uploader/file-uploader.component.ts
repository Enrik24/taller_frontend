import { Component, Output, EventEmitter, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="upload-container mb-4">
      <div class="mb-2">
        <button mat-stroked-button type="button" color="primary" (click)="fileInput.click()">
          <mat-icon>upload_file</mat-icon> Subir Evidencias (Fotos o Audios)
        </button>
        <span class="text-xs text-gray-500 ml-2">Máximo 5 archivos (máx. 10MB c/u)</span>
      </div>
      <input #fileInput type="file" multiple (change)="onFileSelected($any($event).target.files)" accept="image/*,audio/*" class="hidden" />
      
      @if (errorMsg()) {
        <p class="text-red-500 text-sm mb-2 font-medium">{{ errorMsg() }}</p>
      }

      <div class="previews flex flex-wrap gap-4 mt-4">
        @for (preview of previews(); track preview) {
          <div class="preview-card relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm">
            @if (preview.startsWith('blob:')) {
              <img [src]="preview" class="w-full h-full object-cover" alt="Evidencia previsualización" />
            } @else {
              <mat-icon class="text-gray-400" style="font-size: 40px; width: 40px; height: 40px;">audio_file</mat-icon>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hidden {
      display: none;
    }
  `]
})
export class FileUploaderComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() filesUploaded = new EventEmitter<File[]>();
  
  previews = signal<string[]>([]);
  errorMsg = signal<string | null>(null);

  selectedFiles: File[] = [];

  onFileSelected(filesList: FileList) {
    this.errorMsg.set(null);
    const files = Array.from(filesList);
    
    if (this.selectedFiles.length + files.length > 5) {
      this.errorMsg.set('Solo se permiten un máximo de 5 archivos en total.');
      // Reset input
      if (this.fileInput) this.fileInput.nativeElement.value = '';
      return;
    }

    const currentPreviews = this.previews();
    const newPreviews = [...currentPreviews];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        this.errorMsg.set(`El archivo ${file.name} supera los 10MB permitidos.`);
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        return;
      }
      this.selectedFiles.push(file);

      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      } else if (file.type.startsWith('audio/')) {
        newPreviews.push('audio_icon'); // Used as identifier since blobs start with blob:
      } else {
        // Fallback for unknown allowed types
        newPreviews.push('audio_icon');
      }
    }

    this.previews.set(newPreviews);
    this.filesUploaded.emit(this.selectedFiles);
    
    // Reset input to allow selecting same file again if removed (feature for future)
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }
}
