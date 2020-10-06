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
import { MatDialog } from '@angular/material/dialog';
import { ServiceFormObject } from 'src/app/shared/models/service-form-object.model';
import { FormSubmitComponent } from '../form-submit/form-submit.component';
import { v4 as uuidv4 } from 'uuid';
import { frontBack } from 'src/app/shared/validators/front-back.validator';
import { AdditionalDoc } from 'src/app/shared/models/additional-doc.model';
import { SubType } from 'src/app/shared/models/sub-type.model';
import { StepType } from 'src/app/shared/models/step-type.model';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css'],
})
export class ServiceFormComponent implements OnInit {
  @Input() allowedCountries: string[] = [];

  editing = false;
  savedOnce = false;
  @Output() saved = new EventEmitter<boolean>();
  prepopulated = false; //for later use

  subtype = SubType;
  steptype = StepType;
  additionalDocArray: AdditionalDoc[] = [];
  additional = false;
  serviceForm: FormGroup;
  disableAdditionalDocs = true;
  showError = false;

  skippableSteps: string[] = [];
  skippableStepOptions: string[] = [];

  stepsThatRequireProof: Object[] = [];
  stepsThatRequireProofOptions: Object[] = [];

  stepsThatRequireAttention: string[] = [];
  stepsThatRequireAttentionOptions: string[] = [];

  controlNames = [
    'serviceConfigName',
    'baseRedirectUrl',
    'blinkingParams',
    'willEmbedInIframe',
    'skippableSteps',
    'stepsThatRequireProofOfDocuments',
    'maxNumberOfTries',
    'stepsThatRequireAttention',
    'shouldAskForFaceEnroll',
    'defaultCountry',
    'additionalDocSubType',
    'additionalDocDescription',
    'initialSessionConfig',
  ];

  @ViewChild('docDesc') additionalDocDesc: ElementRef<HTMLInputElement>;

  initServiceForm() {
    this.serviceForm = new FormGroup({
      serviceConfigName: new FormControl('', Validators.required),
      baseRedirectUrl: new FormControl('', [
        Validators.required,
        Validators.pattern(
          'https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,}'
        ),
      ]),
      blinkingParams: new FormControl([], [Validators.required]),
      willEmbedInIframe: new FormControl(null, [Validators.required]),
      skippableSteps: new FormControl([]),
      stepsThatRequireProofOfDocuments: new FormControl([]),
      initialSessionConfig: new FormControl('', [
        Validators.required,
        frontBack,
      ]),
      stepsThatRequireAttention: new FormControl([]),
      maxNumberOfTries: new FormControl(null, [Validators.required]),
      shouldAskForFaceEnroll: new FormControl(null, [Validators.required]),
      defaultCountry: new FormControl('', [Validators.required]),
      additionalDocSubType: new FormControl(''),
      additionalDocDescription: new FormControl(''),
    });
  }

  submit() {
    const formObject: ServiceFormObject = {
      baseRedirectUrl: this.serviceForm.controls.baseRedirectUrl.value,
      blinkingParams: this.serviceForm.controls.blinkingParams.value,
      willEmbedInIframe: this.serviceForm.controls.willEmbedInIframe.value,
      serviceConfiguration: {
        skippableSteps: this.serviceForm.controls.skippableSteps.value,
        stepsThatRequireAttention: this.serviceForm.controls
          .stepsThatRequireAttention.value,
        stepsThatRequireProofOfDocuments: this.serviceForm.controls
          .stepsThatRequireProofOfDocuments.value,
        initialSessionConfig: this.serviceForm.controls.initialSessionConfig
          .value,
      },
    };

    const dialogRef = this.dialog.open(FormSubmitComponent, {
      width: '500px',
      data: { formObject, id: uuidv4() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.serviceForm.reset({
        willEmbedInIframe: false,
        skippableSteps: [],
        stepsThatRequireProofOfDocuments: [],
        stepsThatRequireAttention: [],
      });
    });

    console.log(formObject);
  }

  constructor(public dialog: MatDialog) {}

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

  frontBackValidator() {
    return (
      !this.serviceForm.controls.initialSessionConfig.hasError('required') &&
      this.serviceForm.controls.initialSessionConfig.touched &&
      !this.serviceForm.controls.initialSessionConfig.valid
    );
  }

  checkValidityProofOfDocs() {
    if (this.additional) {
      console.log(1);
      this.serviceForm
        .get('stepsThatRequireProofOfDocuments')
        .setValidators(Validators.required);
      this.serviceForm
        .get('stepsThatRequireProofOfDocuments')
        .updateValueAndValidity();
      this.showError = true;
      this.serviceForm.get('stepsThatRequireProofOfDocuments').markAsTouched();
    } else {
      console.log(2);
      this.serviceForm
        .get('stepsThatRequireProofOfDocuments')
        .clearValidators();
      this.serviceForm
        .get('stepsThatRequireProofOfDocuments')
        .updateValueAndValidity();
      this.showError = false;
    }
    console.log(this.serviceForm.get('stepsThatRequireProofOfDocuments'));
  }

  documentDisabler(document: string) {
    return (
      this.serviceForm.get('initialSessionConfig').value === null ||
      this.serviceForm.get('initialSessionConfig').value.includes(document)
    );
  }

  addNewAditionalDocument() {
    const addDoc: AdditionalDoc = {
      subType: this.serviceForm.get('additionalDocSubType').value,
      description: this.serviceForm.get('additionalDocDescription').value,
    };
    this.additionalDocArray.push(addDoc);
    this.checkValidityProofOfDocs();
    this.serviceForm.patchValue({
      additionalDocSubType: '',
      additionalDocDescription: '',
    });
  }

  patternValidator(controlName: string) {
    return (
      this.serviceForm.get(controlName).hasError('pattern') &&
      this.serviceForm.get(controlName).touched
    );
  }

  saveServiceConfig() {
    if (!this.savedOnce) {
      this.savedOnce = true;
      this.saved.emit(true);
    }
  }

  ngOnInit(): void {
    this.skippableSteps = ['Account number', 'Contact data'];
    this.stepsThatRequireAttention = ['Account number', 'Address'];
    this.stepsThatRequireProof = [
      'Account number',
      'Address',
      'Additional document',
    ];

    this.initServiceForm();

    this.serviceForm
      .get('stepsThatRequireProofOfDocuments')
      .valueChanges.subscribe((value: string[]) => {
        console.log(value);
      });

    this.serviceForm
      .get('initialSessionConfig')
      .valueChanges.subscribe((value: string[]) => {
        console.log(value);
        this.skippableStepOptions = [];
        this.stepsThatRequireAttentionOptions = [];
        this.stepsThatRequireProofOptions = [];

        if (!value) return;

        value.forEach((step) => {
          if (this.skippableSteps.includes(step)) {
            this.skippableStepOptions.push(step);
          }
          if (this.stepsThatRequireProof.includes(step)) {
            this.stepsThatRequireProofOptions.push(step);
          }
          if (this.stepsThatRequireAttention.includes(step)) {
            this.stepsThatRequireAttentionOptions.push(step);
          }
        });

        if (value.includes('Additional document')) {
          this.additional = true;
        } else {
          this.additional = false;
          this.checkValidityProofOfDocs();
          this.additionalDocArray = [];
        }

        if (
          !value.includes('Document type') &&
          !value.includes('Document type with country') &&
          (value.includes('Front side') || value.includes('Back side'))
        ) {
          const index1 = value.indexOf('Front side');
          if (index1 !== -1) {
            value.splice(index1, 1);
          }

          const index2 = value.indexOf('Back side');
          if (index2 !== -1) {
            value.splice(index2, 1);
          }

          this.serviceForm.patchValue({
            initialSessionConfig: value,
          });
        }
      });

    this.serviceForm
      .get('additionalDocSubType')
      .valueChanges.subscribe((value: string) => {
        switch (value) {
          case this.subtype.DOCUMENT_COPY: {
            this.serviceForm.patchValue({
              additionalDocDescription: this.subtype.DOCUMENT_COPY,
            });
            this.additionalDocDesc.nativeElement.disabled = true;
            break;
          }
          case this.subtype.PROOF_OF_ADDRESS: {
            this.serviceForm.patchValue({
              additionalDocDescription: this.subtype.PROOF_OF_ADDRESS,
            });
            this.additionalDocDesc.nativeElement.disabled = true;
            break;
          }
          case this.subtype.PROOF_OF_INCOME: {
            this.serviceForm.patchValue({
              additionalDocDescription: this.subtype.PROOF_OF_INCOME,
            });
            this.additionalDocDesc.nativeElement.disabled = true;
            break;
          }
          case this.subtype.OTHER: {
            this.serviceForm.patchValue({
              additionalDocDescription: '',
            });
            this.additionalDocDesc.nativeElement.disabled = false;
            break;
          }
        }
      });
  }
}
