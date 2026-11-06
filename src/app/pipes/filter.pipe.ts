import { Pipe, PipeTransform } from '@angular/core';

// A Pipe transforms a value for display. Pure pipes rerun when an input reference/value
// changes, which is a good fit because search text and refreshed record arrays change.
@Pipe({ name: 'filterRecords', standalone: true, pure: true })
export class FilterPipe implements PipeTransform {
  // Angular calls transform(records, searchText) from the template expression.
  // The same implementation checks values from either the employee or student records.
  transform<T extends Record<string, unknown>>(records: T[] | null, searchText: string, entityType: 'employee' | 'student'): T[] {
    if (!records) return [];
    const query = searchText.trim().toLocaleLowerCase();
    if (!query) return records;

    // Only the meaningful fields requested for that type are searched. The pipe
    // returns a new list for the table while leaving the API response unchanged.
    const fields = entityType === 'employee'
      ? ['name', 'email', 'department', 'designation']
      : ['name', 'email', 'course', 'college'];
    return records.filter((record) => fields.some((field) =>
      String(record[field] ?? '').toLocaleLowerCase().includes(query),
    ));
  }
}

