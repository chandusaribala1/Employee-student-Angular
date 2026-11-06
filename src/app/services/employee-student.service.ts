import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { Student } from '../models/student.model';

// Injectable tells Angular that this class can be created and supplied through
// dependency injection. providedIn:'root' makes one shared service available app-wide.
@Injectable({ providedIn: 'root' })
export class EmployeeStudentService {
  private readonly http = inject(HttpClient);
  private readonly employeeUrl = 'http://localhost:3000/employees';
  private readonly studentUrl = 'http://localhost:3000/students';

  // Observable<Employee[]> means a future asynchronous response containing employees.
  // HttpClient creates this cold Observable; subscribing in App starts the HTTP request.
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeeUrl);
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.employeeUrl}/${encodeURIComponent(id)}`);
  }

  addEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(this.employeeUrl, employee);
  }

  updateEmployee(id: string, employee: Omit<Employee, 'id'>): Observable<Employee> {
    // PUT targets the existing ID, so Edit never creates a duplicate with POST.
    return this.http.put<Employee>(`${this.employeeUrl}/${encodeURIComponent(id)}`, { ...employee, id });
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.employeeUrl}/${encodeURIComponent(id)}`);
  }

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.studentUrl);
  }

  getStudentById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.studentUrl}/${encodeURIComponent(id)}`);
  }

  addStudent(student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(this.studentUrl, student);
  }

  updateStudent(id: string, student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.put<Student>(`${this.studentUrl}/${encodeURIComponent(id)}`, { ...student, id });
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.studentUrl}/${encodeURIComponent(id)}`);
  }
}

