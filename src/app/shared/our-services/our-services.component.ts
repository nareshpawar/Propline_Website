import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { OurServices } from './our-services';
import { OurServicesApi } from '../our-services-api';


@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.scss']
})
export class OurServicesComponent implements OnInit {

 services:Observable<OurServices[]>;

 constructor(private OurServicesApiService: OurServicesApi,
  private router: Router) {}

  loadServices() {
   this.OurServicesApiService.getServiceList().subscribe(
      res=> {
        this.services = res.data;
      }
    );
  }

  ngOnInit() {
    this.loadServices();
  }

}
