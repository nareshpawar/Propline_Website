import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HeaderShowServiceService } from '../header-show-service.service';

@Component({
  selector: 'app-toolbar1',
  templateUrl: './toolbar1.component.html'
})
export class Toolbar1Component implements OnInit {
  @Output() onMenuIconClick: EventEmitter<any> = new EventEmitter<any>();
  changeHederFlag:boolean = true;
  constructor(public appService:AppService,private _hederShowService:HeaderShowServiceService) { 
    this._hederShowService.headerFlag.subscribe(res =>{
      this.changeHederFlag = res;
      // console.log(res);
      
    })
  }
  ngOnInit() { }

  public sidenavToggle(){
    this.onMenuIconClick.emit();
  }
}