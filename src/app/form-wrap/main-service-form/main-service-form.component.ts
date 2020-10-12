import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/shared/models/country.model';
import { ServiceConfig } from 'src/app/shared/models/service-config.model';
import { ServiceObject } from 'src/app/shared/models/service-object.model';
import { StepType } from 'src/app/shared/models/step-type.model';
import { FlagsService } from 'src/app/shared/services/flags.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-main-service-form',
  templateUrl: './main-service-form.component.html',
  styleUrls: ['./main-service-form.component.css'],
})
export class MainServiceFormComponent implements OnInit {
  serviceForm: FormGroup;
  countries: string[];
  country = Country;
  serviceConfigForms: ServiceConfig[] = [];
  editing = false;
  name = '';
  serviceSaved = false;
  expandConfigPanels = false;
  allowedDefault = [
    'Document type with country',
    'Document type',
    'Front side',
    'Back side',
    'Adress',
    'Account number',
    'Face',
    'Contact data',
    'Video session',
    'Additional document',
  ];
  @Input() expand: boolean;
  @Input() serviceObject: ServiceObject;
  @Output() saved = new EventEmitter<boolean>();
  @Output() deleting = new EventEmitter<number>();

  savedServiceConfigForms = 0;

  constructor(public flags: FlagsService) {}

  ngOnInit(): void {
    if (this.serviceObject.serviceConfigs) {
      this.serviceConfigForms = this.serviceObject.serviceConfigs;
    } else {
      this.serviceConfigForms = [];
    }
    this.name = this.serviceObject.name;
    this.countries = ['Serbia', 'Montenegro', 'United States', 'Great Britain'];
    this.initServiceForm();

    if (this.serviceForm.get('serviceName').value === '') {
      this.enableEditing();
    }

    this.serviceForm.get('serviceName').valueChanges.subscribe((value) => {
      this.name = value;
    });
  }

  controlNames = [
    'serviceName',
    'maxNumberOfTries',
    'shouldAskForFaceEnroll',
    'defaultCountry',
    'allowedCountries',
    'sessionValidityDuration',
  ];

  initServiceForm() {
    this.serviceForm = new FormGroup({
      serviceName: new FormControl(
        { value: this.serviceObject.name, disabled: true },
        [Validators.required]
      ),
      maxNumberOfTries: new FormControl(
        {
          value: this.serviceObject.serviceConfiguration.maxNumberOfTries,
          disabled: true,
        },
        [Validators.required]
      ),
      shouldAskForFaceEnroll: new FormControl(
        {
          value: this.serviceObject.serviceConfiguration.shouldAskForFaceEnroll,
          disabled: true,
        },
        [Validators.required]
      ),
      defaultCountry: new FormControl(
        {
          value: this.serviceObject.serviceConfiguration.defaultCountry,
          disabled: true,
        },
        [Validators.required]
      ),
      allowedCountries: new FormControl(
        {
          value: this.serviceObject.serviceConfiguration.allowedCountries,
          disabled: true,
        },
        [Validators.required]
      ),
      sessionValidityDuration: new FormControl(
        {
          value: this.serviceObject.serviceConfiguration.sessionValidity,
          disabled: true,
        },
        [Validators.required]
      ),
    });
  }

  addServiceConfigForm() {
    const newConfig: ServiceConfig = {
      serviceConfigId: uuidv4(),
      baseRedirectUrl: '',
      defaultCountry: null,
      blinkingParams: [],
      maxNumberOfTries: null,
      shouldAskForFaceEnroll: true,
      initialSessionConfig: [],
      name: '',
      willEmbedInIframe: true,
      skippableSteps: [],
      stepsThatRequireAttention: [],
      stepsThatRequireProofOfDocuments: [],
    };
    this.expandConfigPanels = true;
    this.serviceConfigForms.push(newConfig);
  }

  onDeleteService() {
    this.deleting.emit(this.serviceObject.id);
  }

  deleteServiceConfigForm(id: string) {
    this.serviceConfigForms = this.serviceConfigForms.filter((elem) => {
      return elem.serviceConfigId !== id;
    });
  }

  enableEditing() {
    if (this.editing) {
      this.disableEditing();
      return;
    }

    this.controlNames.forEach((control) => {
      this.serviceForm.get(control).enable();
    });
    this.editing = true;
  }

  disableEditing() {
    this.controlNames.forEach((control) => {
      this.serviceForm.get(control).disable();
    });
    this.editing = false;
  }

  requiredValidator(controlName: string) {
    return (
      this.serviceForm.get(controlName).hasError('required') &&
      this.serviceForm.get(controlName).touched
    );
  }

  updateServiceDetails() {
    if (!this.serviceSaved) {
      this.serviceSaved = true;
      this.saved.emit(true);
    }
    this.disableEditing();
  }

  saveServiceDetails() {
    this.serviceSaved = true;
    this.disableEditing();
  }

  onSavedServiceForm(saved: boolean) {
    if (saved) {
      this.savedServiceConfigForms++;
    }
  }
}
