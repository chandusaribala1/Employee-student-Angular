import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { Employee } from './models/employee.model';
import { Student } from './models/student.model';

describe('Employee and Student management', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  const employees: Employee[] = [{ id: '1', name: 'Maya Patel', email: 'maya@example.com', department: 'IT', designation: 'Developer', salary: 65000 }];
  const students: Student[] = [{ id: '1', name: 'Riya Shah', email: 'riya@example.com', course: 'Angular', college: 'Northview', age: 21 }];

  async function flushRefresh(): Promise<void> {
    http.expectOne('http://localhost:3000/employees').flush(employees);
    http.expectOne('http://localhost:3000/students').flush(students);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await flushRefresh();
  });

  afterEach(() => http.verify());

  it('receives API records in the component for the reusable table', () => {
    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.employees).toEqual(employees);
    expect(fixture.componentInstance.students).toEqual(students);
  });

  it('applies the requested role permissions', () => {
    const app = fixture.componentInstance;
    app.selectRole('Employee');
    expect(app.canManage).toBe(false);
    app.selectSection('students');
    expect(app.canManage).toBe(true);
    app.selectRole('Student');
    expect(app.section).toBe('students');
    expect(app.canManage).toBe(false);
    app.selectSection('employees');
    expect(app.section).toBe('students');
  });

  it('validates the reactive form, then adds a student with POST and reloads lists', async () => {
    const app = fixture.componentInstance;
    app.selectSection('students');
    app.startAdd();
    app.saveRecord();
    expect(http.match((request) => request.method === 'POST')).toHaveLength(0);

    app.studentForm.setValue({ name: 'Alex Kim', email: 'alex@example.com', course: 'Angular', college: 'Northview', age: 22 });
    app.saveRecord();
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/students' }).flush({ id: '4', ...app.studentForm.getRawValue() });
    await flushRefresh();
    expect(app.formMode).toBeNull();
  });

  it('uses the existing record ID for Edit and PUT rather than POST', async () => {
    const app = fixture.componentInstance;
    app.editRecord({ ...employees[0] });
    expect(app.employeeForm.get('name')?.value).toBe('Maya Patel');
    app.employeeForm.patchValue({ designation: 'Senior Developer' });
    app.saveRecord();
    const request = http.expectOne({ method: 'PUT', url: 'http://localhost:3000/employees/1' });
    expect(request.request.body.id).toBe('1');
    expect(request.request.body.designation).toBe('Senior Developer');
    request.flush({ ...employees[0], designation: 'Senior Developer' });
    await flushRefresh();
  });

  it('deletes by ID and reloads the records', async () => {
    const app = fixture.componentInstance;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    app.deleteRecord({ ...employees[0] });
    http.expectOne({ method: 'DELETE', url: 'http://localhost:3000/employees/1' }).flush(null);
    await flushRefresh();
    expect(app.message).toBe('Employee deleted.');
  });

  it('loads a selected record by ID for View', () => {
    const app = fixture.componentInstance;
    app.selectSection('students');
    app.viewRecord({ ...students[0] });
    http.expectOne({ method: 'GET', url: 'http://localhost:3000/students/1' }).flush(students[0]);
    expect(app.selectedRecord?.['name']).toBe('Riya Shah');
  });
});
