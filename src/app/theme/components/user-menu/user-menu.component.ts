import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HeaderShowServiceService } from '../header-show-service.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  changeHederFlag:boolean = true;
  constructor(public appService:AppService,private _hederShowService:HeaderShowServiceService) { 
    this._hederShowService.headerFlag.subscribe(res =>{
      this.changeHederFlag = res;
    })
  }

  ngOnInit() {
  }

  headerContentFlag(){ 
    // console.log(this.changeHederFlag);
    
    this._hederShowService.headerFlag.next(false);
  }

 

}
