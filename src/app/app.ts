import { Component, OnInit, inject } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { Employee } from './models/employee.model';
import { Student } from './models/student.model';
import { EmployeeStudentService } from './services/employee-student.service';
import { FilterPipe } from './pipes/filter.pipe';
import { ButtonComponent } from './shared/button/button.component';
import { TableComponent, TableColumn, TableRecord } from './shared/table/table.component';
import { RecordFormComponent } from './shared/form/record-form.component';

type Role = 'Admin' | 'Employee' | 'Student';
type Section = 'employees' | 'students';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LowerCasePipe, FilterPipe, ButtonComponent, TableComponent, ],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
// App is a standalone parent component. Unlike an NgModule design, it declares the
// standalone template dependencies it uses directly in imports instead of relying
// on a central feature module. app.config.ts supplies application-wide services.
export class App implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly peopleService = inject(EmployeeStudentService);

  readonly roles: Role[] = ['Admin', 'Employee', 'Student'];
  role: Role = 'Admin';
  section: Section = 'employees';
  employees: Employee[] = [];
  students: Student[] = [];
  searchTerm = '';
  loading = true;
  message = '';
  messageType: 'success' | 'error' = 'success';
  formMode: Section | null = null;
  editingId: string | null = null;
  selectedRecord: TableRecord | null = null;
  // A FormGroup is a named collection of FormControls. FormBuilder creates the
  // controls compactly; Validators describe the rules Angular checks before submit.
  // formControlName in app.html connects each input to the matching control below.
  readonly employeeForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    department: ['', [Validators.required, Validators.maxLength(80)]],
    designation: ['', [Validators.required, Validators.maxLength(100)]],
    salary: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(100000000)]],
  });

  readonly studentForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    course: ['', [Validators.required, Validators.maxLength(100)]],
    college: ['', [Validators.required, Validators.maxLength(120)]],
    age: [null as number | null, [Validators.required, Validators.min(1), Validators.max(120), Validators.pattern('^[1-9][0-9]*$')]],
  });

  // Current entity controls both table columns and the data displayed by the shared table.
  get entityLabel(): string { return this.section === 'employees' ? 'Employee' : 'Student'; }
  get entityType(): 'employee' | 'student' { return this.section === 'employees' ? 'employee' : 'student'; }
  get canManage(): boolean {
    return this.role === 'Admin' || (this.role === 'Employee' && this.section === 'students');
  }
  // Pass this permission object to the table so the child can hide disallowed actions.
  get tablePermissions(): { canView: boolean; canEdit: boolean; canDelete: boolean } {
    return { canView: true, canEdit: this.canManage, canDelete: this.canManage };
  }
  get columns(): TableColumn[] {
    return this.section === 'employees'
      ? [
          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
          { key: 'department', label: 'Department' }, { key: 'designation', label: 'Designation' }, { key: 'salary', label: 'Salary' },
        ]
      : [
          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
          { key: 'course', label: 'Course' }, { key: 'college', label: 'College' }, { key: 'age', label: 'Age' },
        ];
  }
  get records(): TableRecord[] {
    return (this.section === 'employees' ? this.employees : this.students) as unknown as TableRecord[];
  }

  // Angular calls ngOnInit once after constructing this component. forkJoin subscribes
  // to both HTTP Observables and gives the component both arrays when they complete.
  ngOnInit(): void { this.refreshRecords(); }

  refreshRecords(): void {
    this.loading = true;
    forkJoin({ employees: this.peopleService.getEmployees(), students: this.peopleService.getStudents() })
      .subscribe({
        // next receives the JSON responses; assigning them updates records and the table @Input.
        next: ({ employees, students }) => {
          this.employees = employees;
          this.students = students;
          this.loading = false;
        },
        // error receives HTTP/network failures instead of next being called.
        error: (error: unknown) => {
          this.loading = false;
          this.showError('Could not load records. Is JSON Server running at localhost:3000?', error);
        },
        // HttpClient request Observables normally emit once and complete; forkJoin then emits once.
        complete: () => { this.loading = false; },
      });
  }

  Role(role: Role): void {
    this.role = role;
    this.section = role === 'Student' ? 'students' : 'employees';
    this.cancelForm();
    this.selectedRecord = null;
    this.message = '';
  }

  selectSection(section: Section): void {
    if (this.role === 'Student' && section !== 'students') return;
    this.section = section;
    this.cancelForm();
    this.selectedRecord = null;
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  startAdd(): void {
    //check weather the current role can manage records
    if (!this.canManage) return;
    this.formMode = this.section;
    this.editingId = null;
    this.selectedRecord = null;
    this.employeeForm.reset();
    this.studentForm.reset();
  }

  // TableComponent emits a row; this parent fills the Reactive Form for an Edit.
  // patchValue writes existing server data into the matching FormControls.
  editRecord(record: TableRecord): void {
    if (!this.canManage) return;
    this.formMode = this.section;
    this.editingId = String(record['id']);
    this.selectedRecord = null;
    if (this.section === 'employees') {
      this.employeeForm.patchValue({
        name: String(record['name']), email: String(record['email']),
        department: String(record['department']), designation: String(record['designation']), salary: Number(record['salary']),
      });
    } else {
      this.studentForm.patchValue({
        name: String(record['name']), email: String(record['email']),
        course: String(record['course']), college: String(record['college']), age: Number(record['age']),
      });
    }
  }

  // The form's (ngSubmit) calls this method. Invalid controls are marked touched so
  // Bootstrap validation messages show; valid values go to add (POST) or update (PUT).
  saveRecord(): void {
    if (!this.canManage || !this.formMode) return;
    const form = this.formMode === 'employees' ? this.employeeForm : this.studentForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    if (this.formMode === 'employees') {
      const values = this.employeeForm.getRawValue();
      const employee = {
        name: values.name!, email: values.email!, department: values.department!,
        designation: values.designation!, salary: Number(values.salary),
      };
      const request = this.editingId
        ? this.peopleService.updateEmployee(this.editingId, employee)
        : this.peopleService.addEmployee(employee);
      this.runMutation(request, 'Employee saved.', 'employees', true);
    } else {
      const values = this.studentForm.getRawValue();
      const student = {
        name: values.name!, email: values.email!, course: values.course!,
        college: values.college!, age: Number(values.age),
      };
      const request = this.editingId
        ? this.peopleService.updateStudent(this.editingId, student)
        : this.peopleService.addStudent(student);
      this.runMutation(request, 'Student saved.', 'students', true);
    }
  }

  deleteRecord(record: TableRecord): void {
    if (!this.canManage) return;
    const id = String(record['id']);
    if (!window.confirm(`Delete ${String(record['name'])}?`)) return;
    const request = this.section === 'employees'
      ? this.peopleService.deleteEmployee(id)
      : this.peopleService.deleteStudent(id);
    this.runMutation(request, `${this.entityLabel} deleted.`, this.section);
  }

  // View is also an API example: fetch one record by its existing ID and show details.
  viewRecord(record: TableRecord): void {
    const id = String(record['id']);
    const request: Observable<Employee | Student> = this.section === 'employees'
      ? this.peopleService.getEmployeeById(id)
      : this.peopleService.getStudentById(id);
    request.subscribe({
      next: (item: Employee | Student) => { this.selectedRecord = item as unknown as TableRecord; },
      error: (error: unknown) => this.showError('Could not load record details.', error),
    });
  }

  cancelForm(): void {
    this.formMode = null;
    this.editingId = null;
    this.employeeForm.reset();
    this.studentForm.reset();
  }

  // API Observables execute when subscribed to here. next means success; error means
  // failure. HTTP Observables normally complete after that single response. On success,
  // refreshRecords performs GETs and the changed arrays flow into TableComponent @Input.
  private runMutation(request: Observable<unknown>, success: string, entity: Section, closeForm = false): void {
    request.subscribe({
      next: () => {
        this.message = success;
        this.messageType = 'success';
        this.selectedRecord = null;
        if (closeForm) this.cancelForm();
        this.section = entity;
        this.refreshRecords();
      },
      error: (error: unknown) => this.showError('The change could not be saved.', error),
    });
  }

  private showError(message: string, error: unknown): void {
    console.error(message, error);
    this.message = message;
    this.messageType = 'error';
  }
}

