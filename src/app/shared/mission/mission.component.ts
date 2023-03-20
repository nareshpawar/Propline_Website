import { Component, OnInit } from '@angular/core';
import { OurServicesApi } from '../our-services-api';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss']
})
export class MissionComponent implements OnInit {

  constructor(private appService: OurServicesApi) { }
  missionImageUrl: string;
  missionModels: any = [];
  ngOnInit() {
    this.getMissions();
  }
  getMissions() {
    this.appService.getMissionservices().subscribe(
      res => {
        if(res.data.length !== 0){
          this.missionImageUrl = res.data[0].image;
          // this.missionModels = res.data[0].missionModels;
          res.data?.forEach(element => {
            this.missionModels.push(element.missionModels[0])
          });
        }
      }
    );
  }

}
