import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from '../../app.service'; 

@Component({
  selector: 'app-properties-search',
  templateUrl: './properties-search.component.html',
  styleUrls: ['./properties-search.component.scss']
})
export class PropertiesSearchComponent implements OnInit {
  @Input() variant:number = 1;
  @Input() vertical:boolean = false;
  @Input() searchOnBtnClick:boolean = false;
  @Input() removedSearchField:string;
  @Output() onSearchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSearchClick: EventEmitter<any> = new EventEmitter<any>();
  public showMore: boolean = false;
  public form: FormGroup;
  public propertyTypes = [];
  public propertyStatuses = [];
  public cities = [];
  public neighborhoods = [];
  public streets = [];
  public features = [];
  public society = [];
  public rentalSociety = [];
  furnishedStatus = ["Furnished", "Unfurnished", "Semi-Furnished"];

  constructor(public appService:AppService, public fb: FormBuilder) { }

  ngOnInit() {
    if(this.vertical){
      this.showMore = true;
    };
    this.propertyTypes = this.appService.getPropertyTypes();
    // this.getPropertyTypeController();
    // this.getSocietyDetails();
    this.getRentalDetails();
    this.propertyStatuses = this.appService.getPropertyStatuses();
    // this.cities = this.appService.getCities();
    this.getCity();
    // this.neighborhoods = this.appService.getNeighborhoods();
    // this.streets = this.appService.getStreets();
    this.features = this.appService.getFeatures();
    this.form = this.fb.group({
      propertyType: null,
      propertyStatus: null, 
      society:null,
      furnished:null,
      location:null,
      bhk:null,
      price: this.fb.group({
        from: null,
        to: null 
      }),
      city: null,
      zipCode: null,
      neighborhood: null,
      street: null,
      bedrooms: this.fb.group({
        from: null,
        to: null 
      }),
      bathrooms: this.fb.group({
        from: null,
        to: null 
      }),
      garages: this.fb.group({
        from: null,
        to: null 
      }),
      area: this.fb.group({
        from: null,
        to: null 
      }),
      yearBuilt: this.fb.group({
        from: null,
        to: null 
      }),       
      features: this.buildFeatures()
    }); 
    
    this.onSearchChange.emit(this.form);
  }

  notifier = new Subject();
  // getPropertyTypeController() {
  //   this.appService.getPropertyTypeController().pipe(takeUntil(this.notifier)).subscribe((res: any) => {
  //     this.propertyTypes = res.data;
  //   })
  // }
 
  getSocietyDetails(){
    this.appService.geSocietyDetails().pipe(takeUntil(this.notifier)).subscribe((res: any) => {
      this.society = res.data;
      // console.log(this.society);
    })
  
  }

  getRentalDetails(){
    this.appService.getRentalSociety().pipe(takeUntil(this.notifier)).subscribe((res: any) => {
      this.rentalSociety = res.data;
      // console.log(this.rentalSociety);
    })
  }
 
  public buildFeatures() {
    const arr = this.features.map(feature => { 
      return this.fb.group({
        id: feature.id,
        name: feature.name,
        selected: feature.selected
      });
    })   
    return this.fb.array(arr);
  }

  getCity(){

    this.appService.getCity().subscribe(res=>{
      this.cities = res['data']?.map(ele=>{
        return {
                 id: ele.city_id, 
                 name: ele.city 
        }
      })
    })

  }
  

  ngOnChanges(){ 
    if(this.removedSearchField){ 
      if(this.removedSearchField.indexOf(".") > -1){
        let arr = this.removedSearchField.split(".");
        this.form.controls[arr[0]]['controls'][arr[1]].reset();
      } 
      else if(this.removedSearchField.indexOf(",") > -1){        
        let arr = this.removedSearchField.split(","); 
        this.form.controls[arr[0]]['controls'][arr[1]]['controls']['selected'].setValue(false);  
      }
      else{
        this.form.controls[this.removedSearchField].reset();
      }  
    }  
  }

  public reset(){     
    this.form.reset({ 
      propertyType: null,
      propertyStatus: null,
      society:null,
      furnished:null,
      location:null,
      bhk:null, 
      price: {
        from: null,
        to: null 
      },
      city: null,
      zipCode: null,
      neighborhood: null,
      street: null,
      bedrooms: {
        from: null,
        to: null 
      },
      bathrooms: {
        from: null,
        to: null 
      },
      garages: {
        from: null,
        to: null 
      },
      area: {
        from: null,
        to: null 
      },
      yearBuilt: {
        from: null,
        to: null 
      },       
      features: this.features    
    }); 
  }

  public search(){
    this.onSearchClick.emit(); 
  }

  public onSelectCity(){
    this.form.controls['neighborhood'].setValue(null, {emitEvent: false});
    this.form.controls['street'].setValue(null, {emitEvent: false});
  }
  public onSelectNeighborhood(){
    this.form.controls['street'].setValue(null, {emitEvent: false});
  }

  public getAppearance(){
    return (this.variant != 3) ? 'outline' : '';
  }
  public getFloatLabel(){
    return (this.variant == 1) ? 'always' : '';
  }


}
