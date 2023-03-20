import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Subject, Subscription } from 'rxjs'; 
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators'; 
import { Settings, AppSettings } from '../../app.settings';
import { AppService } from '../../app.service';
import { Property, Pagination } from '../../app.models'; 
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  public sidenavOpen:boolean = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation:true
  };
  public properties: Property[];
  public viewType: string = 'grid';
  public viewCol: number = 33.3;
  public count: number = 12;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public pagination:Pagination = new Pagination(1, this.count, null, 2, 0, 0); 
  public message:string;
  public watcher: Subscription;

  public settings: Settings;
  rentalIds = "Commercial";
  propertyTypes: any;
  constructor(public appSettings:AppSettings, 
              public appService:AppService, 
              public mediaObserver: MediaObserver,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.settings = this.appSettings.settings;    
    this.watcher = mediaObserver.asObservable()
    .pipe(filter((changes: MediaChange[]) => changes.length > 0), map((changes: MediaChange[]) => changes[0]))
    .subscribe((change: MediaChange) => {
      if (change.mqAlias == 'xs') {
        this.sidenavOpen = false;
        this.viewCol = 100;
      }
      else if(change.mqAlias == 'sm'){
        this.sidenavOpen = false;
        this.viewCol = 50;
      }
      else if(change.mqAlias == 'md'){
        this.viewCol = 50;
        this.sidenavOpen = true;
      }
      else{
        this.viewCol = 33.3;
        this.sidenavOpen = true;
      }
    });

  }

  ngOnInit() {
    this.getPropertyTypeController();
    this.appService.rentalSubject.subscribe(res=>{
      localStorage.setItem("propertyType", res);
      if(res == 4 ){
        this.getProperties('',"Commercial" );
      }else if(res == 5){
        this.getProperties('',"Residential" );
      }else{
        this.getProperties();
      }
     })

     if(localStorage.getItem("propertyType") && localStorage.getItem("propertyType") == undefined){
      localStorage.setItem("propertyType", history.state.id);
     }
   
     
     if(history.state.id == 4  || localStorage.getItem("propertyType") == "4"){
      this.getProperties('',"Commercial" );
    }else if(history.state.id == 5 || localStorage.getItem("propertyType") == "5"){
      this.getProperties('',"Residential" );
    }else{
      this.getProperties();
    }
    //  if(history.state.id == undefined){
    //   this.getProperties();
    // }
  }
  ngOnDestroy(){ 
    localStorage.clear();
    this.watcher.unsubscribe();
  }
  notifier = new Subject();
  getPropertyTypeController() {
    this.appService.getPropertyTypeController().pipe(takeUntil(this.notifier)).subscribe((res: any) => {
      this.propertyTypes = res.data;
    })
  }
  getPropertyName(id){
    let PropertyData =this.propertyTypes?.find(item => item.property_type_id == id);
    return  PropertyData?.property_name;
  }

  public getProperties(id?,propertyType?){   
    this.appService.getProperties().subscribe(res => { 
      
      let data = res.data?.reverse().filter(property => property.property_for === "For Rent")?.map(ele => {

        return {
          "id": ele?.propertyId,
          "title": ele?.society?.society,
          "desc": ele?.property_desc,
          "society":ele?.society,
          "propertyType": this.getPropertyName(ele?.property_type), //ele?.property_type,
          "propertyStatus": [
            ele?.property_for
          ],
          "city": ele?.society?.streets?.neighborhood?.cities?.city,
          "zipCode": ele?.society?.pin,
          "neighborhood": [
            ele?.society?.streets?.neighborhood?.neighborhood
          ],
          "street": [
            ele?.society?.streets?.street,
          ],
          "location": {
            "lat": 40.84915,
            "lng": -73.9351
          },
          "formattedAddress": ele?.society?.streets?.street + ',' + ele?.society?.streets?.neighborhood?.neighborhood + ',' + ele?.society?.streets?.neighborhood?.cities?.city, // ele?.society?.location + ',' +
          "features": [
            "Air Conditioning",
            "Barbeque",
            "Dryer",
            "Microwave",
            "Refrigerator",
            "Fireplace",
            "Swimming Pool",
            "TV Cable",
            "WiFi"
          ],
          "featured": false,
          "priceDollar": {
            "sale": ele?.price_details?.expectedPrice,
            "rent": null
          },
          "priceEuro": {
            "sale": null,
            "rent": null
          },
          "bedrooms": ele?.property_features?.Bedrooms,
          "bathrooms": ele?.property_features?.bathrooms,
          // "garages": 1,
          "Balconies": ele?.property_features?.Balconies,
          "furnishedStatus": ele?.property_features?.furnishedStatus,
          "total_floor": ele?.property_features?.total_floor,
          "floorNo": ele?.property_features?.floorNo,
          "area": {
            "value": ele?.property_area?.superArea !== '' ? ele?.property_area?.superArea : ele?.commercial_details?.builtUpArea !== null ? ele?.commercial_details?.builtUpArea :'',
            "unit":  ele?.property_area?.superArea !== '' ? ele?.property_area?.super_major :ele?.commercial_details?.builtUpArea !== null ? ele?.commercial_details?.built_major :'',
          },
          "yearBuilt": 2007,
          // "property_posted_on":ele?.property_posted_on,
          "ratingsCount": 3,
          "ratingsValue": 280,
          "additionalFeatures": [
            {
              "name": "Heat",
              "value": "Natural Gas"
            },
            {
              "name": "Roof",
              "value": "Composition/Shingle"
            },
            {
              "name": "Floors",
              "value": "Wall-to-Wall Carpet"
            },
            {
              "name": "Water",
              "value": "District/Public"
            },
            {
              "name": "Cross Streets",
              "value": "Orangethorpe-Gilbert"
            },
            {
              "name": "Windows",
              "value": "Skylights"
            },
            {
              "name": "Flat",
              "value": "5"
            },
            {
              "name": "Childroom",
              "value": "2"
            }
          ],
          "gallery": ele?.gallery_media?.map(ele => {
            return {
              "small": ele?.small,
              "medium": ele?.medium,
              "big": ele?.big
            }
          })
          ,
          "plans": [
            {
              "name": "First floor",
              "desc": "Plan description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium magnam veniam sit reprehenderit deserunt ad voluptates id aperiam veritatis! Nobis saepe quos eveniet numquam vitae quis, tenetur consectetur impedit dolore.",
              "area": {
                "value": 1180,
                "unit": "Sq-ft"
              },
              "rooms": 3,
              "baths": 1,
              "image": "assets/images/others/plan-1.jpg"
            },
            {
              "name": "Second floor",
              "desc": "Plan description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium magnam veniam sit reprehenderit deserunt ad voluptates id aperiam veritatis! Nobis saepe quos eveniet numquam vitae quis, tenetur consectetur impedit dolore.",
              "area": {
                "value": 1200,
                "unit": "Sq-ft"
              },
              "rooms": 5,
              "baths": 2,
              "image": "assets/images/others/plan-2.jpg"
            }
          ],
          "videos": [
            {
              "name": "Video",
              "link": "http://themeseason.com/data/videos/video-1.mp4"
            },
            {
              "name": "Video with 'ngx-embed-video' plugin",
              "link": "https://www.youtube.com/watch?v=-NInBEdSvp8"
            }
          ],
          "published": ele?.property_posted_on,
          "lastUpdate": "2019-05-20 14:20:00",
          "views": 322,
          "commercial_details":ele?.commercial_details,
          "commercial_extra":ele?.commercial_extra
        }


      })
      data?.forEach((element,i) => {
        if(JSON.stringify(res.data[i].covered_image) !== "{}"  && res.data[i].covered_image !== null && res.data[i].covered_image !== undefined){

          element.gallery?.unshift({
            "small": res.data[i].covered_image?.Small,
            "medium": res.data[i].covered_image?.Medium,
            "big": res.data[i].covered_image?.Big
          })
        }
      })

      let result;
      if( id!== 1 && propertyType){
        result = this.filterByRental(data,propertyType); 
      }else{
        result = this.filterData(data); 
      }
      
      if(result.data.length === 0){
        this.properties = [];
        this.pagination = new Pagination(1, this.count, null, 2, 0, 0);  
        this.message = 'No Results Found';
        return false;
      } 
      
      this.properties = result.data;
      // this.properties.reverse();
      this.pagination = result.pagination;
      this.message = null;
    })
  }

  public resetPagination(){ 
    if(this.paginator){
      this.paginator.pageIndex = 0;
    }
    this.pagination = new Pagination(1, this.count, null, null, this.pagination.total, this.pagination.totalPages);
  }

  public filterData(data){
    return this.appService.filterData(data, this.searchFields, this.sort, this.pagination.page, this.pagination.perPage,"For Rent","rental");
  }
  public filterByRental(data,propertyType?){
    return this.appService.filterByRental(data, propertyType, this.sort, this.pagination.page, this.pagination.perPage);
  }

  public searchClicked(){ 
    this.properties.length = 0;
    this.getProperties(); 
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0,0);
    }  
  }
  
  public searchChanged(event){
    event.valueChanges.subscribe(() => {   
      this.resetPagination(); 
      this.searchFields = event.value;
      setTimeout(() => {      
        this.removedSearchField = null;
      });
      if(!this.settings.searchOnBtnClick){     
        this.properties.length = 0;  
      }            
    }); 
    event.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => { 
      if(!this.settings.searchOnBtnClick){    
        this.getProperties(1); 
      }
    });       
  } 
  public removeSearchField(field){ 
    this.message = null;   
    this.removedSearchField = field; 
  } 

  public changeCount(count){
    this.count = count;   
    this.properties.length = 0;
    this.resetPagination();
    this.getProperties();
  }
  public changeSorting(sort){    
    this.sort = sort; 
    this.properties.length = 0;
    this.getProperties();
  }
  public changeViewType(obj){ 
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol; 
  } 


  public onPageChange(e){ 
    this.pagination.page = e.pageIndex + 1;
    this.getProperties();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0,0);
    } 
  }

}