import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
//interface-expected structure of an object
export interface TableColumn {
  key: string;
  label: string;
}

export type TableRecord = Record<string, string | number>;
export type EntityType = 'employee' | 'student';

export interface TablePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ButtonComponent],
  styleUrl: './table.component.scss',
  templateUrl: './table.component.html',
})
export class TableComponent {
  // These @Input values arrive from App. The tables datale only displa and emits events.
  @Input() columns: TableColumn[] = [];
  @Input() records: TableRecord[] = [];
  //current record type
  @Input() entityType: EntityType = 'employee';
  @Input() showActions = false;
  @Input() permissions: TablePermissions = { canView: true, canEdit: false, canDelete: false };

  // @Output EventEmitters carry the clicked row to App; App then calls the service.
  @Output() editRecord = new EventEmitter<TableRecord>();
  @Output() deleteRecord = new EventEmitter<TableRecord>();
  @Output() viewRecord = new EventEmitter<TableRecord>();

  // ButtonComponent emits a click; these handlers attach the row before notifying App.
  onEdit(record: TableRecord): void { this.editRecord.emit(record); }
  onDelete(record: TableRecord): void { this.deleteRecord.emit(record); }
  onView(record: TableRecord): void { this.viewRecord.emit(record); }
}

