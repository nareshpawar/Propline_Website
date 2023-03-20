import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgmCoreModule } from '@agm/core';  
import { SharedModule } from '../../shared/shared.module';
import { PropertiesComponent } from './properties.component';
import { PropertyComponent } from './property/property.component';
import { NoRightClickDirective } from 'src/app/no-right-click.directive';
import { RightClickDirective } from './right-click.directive';

export const routes = [
  { path: '', component: PropertiesComponent, pathMatch: 'full' },
  { path: ':id', component: PropertyComponent }
];

@NgModule({
  declarations: [
    PropertiesComponent, 
    PropertyComponent,
    NoRightClickDirective,
    RightClickDirective
  ],
  exports: [
    PropertiesComponent, 
    
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AgmCoreModule,
    SharedModule
  ]
})
export class PropertiesModule { }
