import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { emailValidator } from 'src/app/theme/utils/app-validators';
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public contactForm: FormGroup;
  public lat: number = 40.678178;
  public lng: number = -73.944158;
  public zoom: number = 12; 
  constructor(public formBuilder: FormBuilder,private appservice: AppService,
    // private toastr: ToastrService,
    ) { }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phone: ['', [Validators.required,Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      message: ['', Validators.required]
    });
  }

  public onContactFormSubmit(values:Object):void {
    if (this.contactForm.valid) {
      // console.log(values);
      this.appservice.contactUs(this.contactForm.value).subscribe(res=>{
        this.contactForm.reset();

        // this.toastr.success("","Data Save Successfully")
        
      },error => {
        this.contactForm.reset();
        // this.toastr.error("","Something went wrong")
      })

    }
  }

}
