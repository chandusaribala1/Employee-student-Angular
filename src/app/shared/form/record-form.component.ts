import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

type FormMode = 'employees' | 'students';

// A standalone child dedicated to rendering either Reactive Form. The parent creates
// and owns the FormGroups, receives submitForm, then decides which service call to make.
@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './record-form.component.html',
  styleUrl: './record-form.component.scss',
})
export class RecordFormComponent {
  // @Input values flow from App into this form child: current kind, edit state and forms.
  @Input({ required: true }) formMode!: FormMode;
  @Input() editing = false;
  @Input({ required: true }) employeeForm!: FormGroup;
  @Input({ required: true }) studentForm!: FormGroup;

  // The child does not save data. It emits intent; App receives it and calls the service.
  @Output() submitForm = new EventEmitter<void>();
  @Output() cancelForm = new EventEmitter<void>();

  // Bootstrap validation appears after the user changes a control or tries to submit.
  invalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}

