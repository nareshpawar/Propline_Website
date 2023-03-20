import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from '../menu.service';
import { Menu } from '../menu.model';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: ['./horizontal-menu.component.scss'],
  providers: [ MenuService ]
})
export class HorizontalMenuComponent implements OnInit {
  @Input('menuParentId') menuParentId;
  public menuItems: Array<Menu>;
  constructor(public menuService:MenuService, private _appServices:AppService) { }

  ngOnInit() {
    this.menuItems = this.menuService.getHorizontalMenuItems();
    this.menuItems = this.menuItems.filter(item => item.parentId == this.menuParentId); 
  }
}
