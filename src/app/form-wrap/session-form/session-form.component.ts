import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.css'],
})
export class SessionFormComponent implements OnInit {
  @Input() sessionForm: FormGroup;

  constructor() {}

  ngOnInit(): void {
    console.log(this.sessionForm);
  }
}
