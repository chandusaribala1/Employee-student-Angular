# Employee and Student Management (Angular)

A beginner-friendly standalone Angular application using Bootstrap, Reactive Forms, RxJS `Observable`s, and JSON Server as a local fake database. The three roles are interface demonstrations only; they are not authentication or security boundaries.

## Start the application

From this folder:

```bash
npm install
npm start
```

In a second terminal:

```bash
npm run api
```

The Angular app opens at `http://localhost:4200`; JSON Server listens at `http://localhost:3000`. The database is `db.json`. Edit it to add or reset sample data. CRUD changes are written to that file while the server is running.

## Folders and files

- `src/main.ts` bootstraps the standalone root component with `appConfig`.
- `src/app/app.config.ts` registers the router and `provideHttpClient()`, which makes `HttpClient` available for dependency injection.
- `src/app/app.ts` is the parent/controller. It owns the selected demonstration role, list, shared search, records, reactive forms, and CRUD event handlers. It asks the service for data and passes columns/records/action permissions to the table.
- `src/app/app.html` is the Bootstrap layout, the one shared search box, role/list selectors, forms, table bindings, alerts, and details view.
- `src/app/app.scss` contains a few small component-specific responsive styles; `src/styles.scss` contains the global page background.
- `src/app/models/employee.model.ts` and `student.model.ts` describe the JSON record shapes for TypeScript.
- `src/app/services/employee-student.service.ts` is the only place that makes HTTP calls. `@Injectable({ providedIn: 'root' })` lets Angular's dependency injection construct one shared service and provide it to `App`.
- `src/app/pipes/filter.pipe.ts` has the pure `filterRecords` pipe used by the common search input for either record type.
- `src/app/shared/button/button.component.ts` is the reusable button. Parent inputs set its label and style; its `@Output() clicked` EventEmitter reports a click upward.
- `src/app/shared/table/table.component.ts` and `.html` display both entities using passed column definitions and records. `@Output()` events send a selected row to `App`; the table never calls the API.
- `db.json` is JSON Server's local database.

## Parent/child communication

`App` passes values into `TableComponent` with `[columns]`, `[records]`, and `[showActions]`. That is `@Input()`: a parent supplies data/configuration for a child to render. `showActions` decides whether Edit and Delete appear. View is available to all three roles.

The table passes a label and Bootstrap style into each `ButtonComponent` using `@Input()`. When clicked, the button emits its `@Output()` `EventEmitter`. The table receives that event and emits its own `edit`, `remove`, or `view` event with the selected row. `App` receives the event binding and performs the operation. `EventEmitter` carries an event to the parent; it does not make API requests.

## Observable HTTP flow

For example, `App.refreshRecords()` calls `peopleService.getEmployees()`. The service returns `Observable<Employee[]>`, meaning an asynchronous stream that will supply an array of employee-shaped records. `HttpClient.get()` creates a cold HTTP Observable: the request starts when the app subscribes. `forkJoin` subscribes to both the employees and students requests. JSON Server handles each GET and responds with JSON. The subscription's `next` callback assigns the response to `employees`/`students`, then the `records` getter supplies the current list to `[records]` on the reusable table.

HTTP Observables normally emit one response and complete. A subscription can provide `next` (response), `error` (request failure), and `complete` (no more values). The mutation helper subscribes to POST/PUT/DELETE; on success it shows a message and performs GETs to refresh both lists. On failure it shows an error. API logic belongs in the injectable service so components describe UI behavior while one service owns endpoints and HTTP methods.

CRUD flow: Add opens a blank `FormGroup`, validates it, then calls POST. Edit uses the row's existing `id`, populates the same kind of Reactive Form with `patchValue()`, then calls PUT for that ID. This prevents Edit from adding a second record. Delete asks for confirmation, then calls DELETE using that ID. View calls GET by ID and displays the returned detail fields.

## Reactive Forms

`FormBuilder` creates each `FormGroup`, a collection of `FormControl`s. Each control tracks an input's value and validation status. `Validators.required`, `Validators.email`, `Validators.min`, and the age integer pattern check values in TypeScript. In the HTML, `[formGroup]` attaches the form object and `formControlName` connects each input to a named control. `(ngSubmit)` calls `saveRecord()`. Invalid forms are marked touched to display Bootstrap feedback; valid values are sent to the service. During Edit, `patchValue()` fills the controls from the selected record.

## Common filter pipe

A pipe is a template value transformer. Angular calls `FilterPipe.transform(records, searchTerm)` for `records | filterRecords: searchTerm`. This pure pipe runs again when the array reference or search string changes. It searches the string form of every meaningful field (including name, email, department, and course) and returns a filtered array; the source records are not mutated. Since the one search string is retained while changing roles or lists, the same input filters whatever is currently displayed.

## Demonstration role permissions

- **Admin:** switches between Employee and Student lists and can add, view, edit, or delete either.
- **Employee:** views employee rows without Add/Edit/Delete; can manage students.
- **Student:** sees student rows and can only view them.

These checks are ordinary UI conditions in `App`; anyone who can call the API can bypass them. Do not treat this demo as production access control.

## Dependencies and API endpoints

Bootstrap is added as an application dependency. JSON Server 0.17.4 is a development dependency and uses the classic `json-server --watch db.json` command.

```bash
npm install
npm start
npm run api
```

Postman endpoints:

| Method | Endpoint | Action |
| --- | --- | --- |
| GET | `http://localhost:3000/employees` | List employees |
| GET | `http://localhost:3000/employees/1` | Read one employee |
| POST | `http://localhost:3000/employees` | Add employee (JSON body) |
| PUT | `http://localhost:3000/employees/1` | Replace/update employee |
| DELETE | `http://localhost:3000/employees/1` | Delete employee |
| GET | `http://localhost:3000/students` | List students |
| GET | `http://localhost:3000/students/1` | Read one student |
| POST | `http://localhost:3000/students` | Add student (JSON body) |
| PUT | `http://localhost:3000/students/1` | Replace/update student |
| DELETE | `http://localhost:3000/students/1` | Delete student |

POST/PUT body example for an employee (omit `id` for POST; keep it matching the URL for PUT):

```json
{ "name": "Alex Kim", "email": "alex@example.com", "department": "IT", "designation": "Developer", "salary": 50000 }
```

POST/PUT body example for a student:

```json
{ "name": "Jamie Lee", "email": "jamie@example.com", "course": "Angular", "college": "Northview College", "age": 21 }
```
