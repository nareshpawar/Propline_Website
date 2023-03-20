import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AgmCoreModule } from '@agm/core'; 
import { ContactComponent } from './contact.component';
import { ContactForSubmitBtnComponent } from './contact-for-submit-btn/contact-for-submit-btn.component';

export const routes = [
  { path: '', component: ContactComponent, pathMatch: 'full'  },
  { path: 'contactForm', component: ContactForSubmitBtnComponent, pathMatch: 'full'  }

];

@NgModule({
  declarations: [ContactComponent, ContactForSubmitBtnComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AgmCoreModule
  ]
})
export class ContactModule { }
