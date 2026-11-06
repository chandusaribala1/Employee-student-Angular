// The Employee interface describes the exact shape returned by /employees.
// HttpClient uses it as a compile-time guide; JSON Server still stores plain JSON.
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
}

