import { Component, OnInit } from '@angular/core';
import { Settings, AppSettings } from '../../app.settings';
import { AppService } from '../../app.service';
import { Property, Pagination, Location } from '../../app.models';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout'; 
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { response } from 'express';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  watcher: Subscription;
  activeMediaQuery = ''; 
  public slides = [];
  public properties:any; //Property[]
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public count: number = 8;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public pagination:Pagination = new Pagination(1, 8, null, 2, 0, 0); 
  public message:string;
  public featuredProperties: Property[] = [];
  public locations: Location[]; 
  public settings: Settings;
  hotListId: any;
  propertyTypes: any;
  constructor(public appSettings:AppSettings, public appService:AppService, public mediaObserver: MediaObserver) {
    this.settings = this.appSettings.settings;

    this.watcher = mediaObserver.asObservable()
    .pipe(filter((changes: MediaChange[]) => changes.length > 0), map((changes: MediaChange[]) => changes[0]))
    .subscribe((change: MediaChange) => {
      // console.log(change)
      if(change.mqAlias == 'xs') {
        this.viewCol = 100;
      }
      else if(change.mqAlias == 'sm'){
        this.viewCol = 50;
      }
      else if(change.mqAlias == 'md'){
        this.viewCol = 33.3;
      }
      else{
        this.viewCol = 25;
      }
    });

  }

  ngOnInit() {  
    this.getPropertyTypeController();
    this.getSlides();
    this.getLocations();
    this.getProperties();  
    // this.getFeaturedProperties();
  }

  ngDoCheck(){
    if(this.settings.loadMore.load){     
      this.settings.loadMore.load = false;     
      this.getProperties();  
    }
  }

  ngOnDestroy(){
    this.resetLoadMore();
    this.watcher.unsubscribe();
  }

  public getSlides(){
    this.appService.getHomeCarouselSlides().subscribe(res=>{
      // console.log(res.data);
      
     
      this.slides = res.data?.map(ele=>{
        return{ 
          "title": "Luxury office space", 
          "location": "230 W 55th St, New York, NY 10019, USA",
          "priceDollar": {
              "sale": 2500000,
              "rent": null
          },
          "priceEuro": {
              "sale": 2200000,
              "rent": null
          },
          "image": ele?.filePath
      }
      })

      // console.log(this.slides);
      
    })
  }

  public getLocations(){
    this.appService.getLocations().subscribe(res =>{
      this.locations = res;
    })
  }

  public getProperties(){  
    this.appService.getProperties().subscribe(data => {      
      if(this.properties && this.properties.length > 0){  
        this.settings.loadMore.page++;
        this.pagination.page = this.settings.loadMore.page; 
      }
      let responseData = data.data.reverse();
      responseData?.forEach(element => {
        if(element.is_hot_listed){
          this.hotListId = element.propertyId;
        }
      });
      let mapData = responseData?.map(ele => {
      
        
        return {
          "id": ele?.propertyId,
          "title": ele?.society?.society,
          "is_feature_property":ele?.is_feature_property,
          "desc": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium magnam veniam sit reprehenderit deserunt ad voluptates id aperiam veritatis! Nobis saepe quos eveniet numquam vitae quis, tenetur consectetur impedit dolore.",
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
          "society":ele?.society,
          "formattedAddress":  ele?.society?.streets?.street + ',' + ele?.society?.streets?.neighborhood?.neighborhood + ',' + ele?.society?.streets?.neighborhood?.cities?.city, //ele?.society?.location + ',' +
          "featured": false,
          "priceDollar": {
            "sale":ele.price_details.expectedPrice !== '' ? Number(ele.price_details.expectedPrice) : Number(ele.commercial_details.expectedPrice),
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
          "furnishedStatus": ele?.property_features?.furnishedStatus !==''? ele?.property_features?.furnishedStatus : ele?.commercial_details?.furnishedStatus,
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
          "gallery": ele?.gallery_media?.map(ele => {
            return {
              "small": ele?.small,
              "medium": ele?.medium,
              "big": ele?.big
            }
          })
          ,
          "published": ele?.property_posted_on,
          "lastUpdate": "2019-05-20 14:20:00",
          "views": 322
        }
      })
        
        mapData?.forEach((element,i) => {
          if(JSON.stringify(responseData[i].covered_image) !== "{}"  && responseData[i].covered_image !== null && responseData[i].covered_image !== undefined){

            element.gallery?.unshift({
              "small": responseData[i].covered_image?.Small,
              "medium": responseData[i].covered_image?.Medium,
              "big": responseData[i].covered_image?.Big
            })
          }
          
        });
      mapData?.forEach(element => {
        if(element.is_feature_property){
          this.featuredProperties.push(element);
        }
      });
      let result = this.filterData(mapData); 
      // console.log(result);
      
      if(result?.data?.length == 0){
        this.properties.length = 0;
        this.pagination = new Pagination(1, this.count, null, 2, 0, 0);  
        this.message = 'No Results Found';
        return false;
      }   
      
      if(this.properties && this.properties.length > 0){   
        this.properties = this.properties.concat(result.data);          
      }
      else{
        this.properties = result.data;  
      } 
      this.pagination = result.pagination;
      this.message = null;

      if(this.properties?.length == this.pagination.total){
        this.settings.loadMore.complete = true;
        this.settings.loadMore.result = this.properties.length;
      }
      else{
        this.settings.loadMore.complete = false;
      }

      if(this.settings.header == 'map'){
        this.locations.length = 0;
        this.properties?.forEach(p => {
          let loc = new Location(p.id, p.location.lat, p.location.lng);
          this.locations.push(loc);
        });
        this.locations = [...this.locations];
      } 
     
    })
  }

  public resetLoadMore(){
    this.settings.loadMore.complete = false;
    this.settings.loadMore.start = false;
    this.settings.loadMore.page = 1;
    this.pagination = new Pagination(1, this.count, null, null, this.pagination.total, this.pagination.totalPages);
  }

  public filterData(data){
    return this.appService.filterData(data, this.searchFields, this.sort, this.pagination.page, this.pagination.perPage);
  }

  public searchClicked(){ 
    this.properties.length = 0;
    this.getProperties(); 
  }
  public searchChanged(event){    
    // console.log(event);
    
    event.valueChanges.subscribe(() => {
      this.resetLoadMore();
      this.searchFields = event.value;
      setTimeout(() => {      
        this.removedSearchField = null;
      });
      if(!this.settings.searchOnBtnClick){     
        this.properties.length = 0;  
      }            
    }); 
    // console.log("this.searchFields",this.searchFields);
    
    event.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => { 
      if(!this.settings.searchOnBtnClick){     
        this.getProperties(); 
      }
    });       
  } 
  public removeSearchField(field){ 
    this.message = null;   
    this.removedSearchField = field; 
  } 
 


  public changeCount(count){
    this.count = count;
    this.resetLoadMore();   
    this.properties.length = 0;
    this.getProperties();

  }
  public changeSorting(sort){    
    this.sort = sort;
    this.resetLoadMore(); 
    this.properties.length = 0;
    this.getProperties();
  }
  public changeViewType(obj){ 
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol; 
  }


  // public getFeaturedProperties(){
  //   this.appService.getFeaturedProperties().subscribe(properties=>{
  //     this.featuredProperties = properties;
  //   })
  // } 

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

}
