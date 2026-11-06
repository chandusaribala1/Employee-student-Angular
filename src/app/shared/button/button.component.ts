import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  // @Input lets a parent pass the text, native button behavior and Bootstrap class.
  @Input() label = 'Action';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() bootstrapClass = 'btn-primary';
  @Input() disabled = false;

  // @Output/EventEmitter sends the click to the parent. The child only reports it;
  // the parent decides whether that click adds, edits, deletes or views a record.
  @Output() buttonClick = new EventEmitter<void>();
}

