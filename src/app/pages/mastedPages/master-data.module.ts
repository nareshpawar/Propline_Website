import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';  
import { InputFileModule } from 'ngx-input-file';
import { CityComponent } from './city/city.component';
import { NeighborhoodComponent } from './neighborhood/neighborhood.component';
import { StreetComponent } from './street/street.component';
import { PropertyComponent } from './property/property.component';


export const routes = [
  { path: 'city', component: CityComponent, pathMatch: 'full'  },
  { path: 'neighborhood', component: NeighborhoodComponent, pathMatch: 'full'  },
  { path: 'street', component: StreetComponent, pathMatch: 'full'  },
  { path: 'property', component: PropertyComponent, pathMatch: 'full'  }



];

@NgModule({
  declarations: [CityComponent,NeighborhoodComponent, StreetComponent, PropertyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AgmCoreModule, 
    InputFileModule
  ]
})
export class MasterDataModule { }
