/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { MapsAPILoader } from '@agm/core';
///////////////////////////////////////////////////////////////////////

import { FormControl } from '@angular/forms';
// import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.

import * as _moment from 'moment';

// tslint:disable-next-line:no-duplicate-imports

import {default as _rollupMoment,Moment} from 'moment'; 
const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

///////////////////////////////////////////////////////////////////////
@Component({
  selector: 'app-submit-property',
  templateUrl: './submit-property.component.html',
  styleUrls: ['./submit-property.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    // {
    //   provide: DateAdapter,
    //   useClass: MomentDateAdapter,
    //   deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    // },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SubmitPropertyComponent implements OnInit {
  @ViewChild('horizontalStepper') horizontalStepper: MatStepper; 
  @ViewChild('addressAutocomplete') addressAutocomplete: ElementRef;
  public submitForm:FormGroup; 
  public features = [];
  public priceIncludes = [];
  public propertyTypes = [];
  public propertyStatuses = [];
  public cities = [];
  public neighborhoods = [];
  public streets = [];
  public lat: number = 40.678178;
  public lng: number = -73.944158;
  public zoom: number = 12;  

  date = new FormControl(moment());

  bedroomFlag:boolean = false;
  
  constructor(public appService:AppService, 
              private fb: FormBuilder, 
              private mapsAPILoader: MapsAPILoader, 
              private ngZone: NgZone) { }

  ngOnInit() {
    // console.log(this.features);
    this.features = this.appService.getFeatures();  
    this.priceIncludes = this.appService.getPriceIncludes();
    this.propertyTypes = this.appService.getPropertyTypes();
    this.propertyStatuses = this.appService.getPropertyStatuses();
    this.cities = this.appService.getCities();
    this.neighborhoods = this.appService.getNeighborhoods();
    this.streets = this.appService.getStreets();  

    this.submitForm = this.fb.group({
      basic: this.fb.group({
        title: [null, ],//Validators.required
        desc: null,
        priceDollar: null,
        priceEuro: null,
        propertyType: [null, ],//Validators.required
        propertyStatus: null, 
        gallery: null
      }),
      address: this.fb.group({
        location: ['', ],//Validators.required
        city: [''], //Validators.required
        zipCode: '',
        neighborhood: '',
        street: ''
      }),
      additional: this.fb.group({
        bedrooms: '',
        bathrooms: '',
        garages: '',
        area: '',
        yearBuilt: '',
        features: this.buildFeatures(),
        priceIncludes : this.buildPriceIncludes()
      }),
      media: this.fb.group({
        videos: this.fb.array([ this.createVideo() ]),
        plans: this.fb.array([ this.createPlan() ]), 
        additionalFeatures: this.fb.array([ this.createFeature() ]),
        featured: false
      })
    }); 

    this.setCurrentPosition();
    this.placesAutocomplete();
  }


  public onSelectionChange(e:any){ 
    if(e.selectedIndex == 4){   
      this.horizontalStepper._steps.forEach(step => step.editable = false);
      // console.log(this.submitForm.value);      
    }
  }
  public reset(){
    this.horizontalStepper.reset(); 

    const videos = <FormArray>this.submitForm.controls.media.get('videos');
    while (videos.length > 1) {
      videos.removeAt(0)
    }
    const plans = <FormArray>this.submitForm.controls.media.get('plans');
    while (plans.length > 1) {
      plans.removeAt(0)
    }
    const additionalFeatures = <FormArray>this.submitForm.controls.media.get('additionalFeatures');
    while (additionalFeatures.length > 1) {
      additionalFeatures.removeAt(0)
    }
    
    this.submitForm.reset({
      additional: {
        features: this.features
      },
      media:{ 
        featured: false
      }
    });   
     
  }

  

  // -------------------- Address ---------------------------  
  public onSelectCity(){
    this.submitForm.controls.address.get('neighborhood').setValue(null, {emitEvent: false});
    this.submitForm.controls.address.get('street').setValue(null, {emitEvent: false});
  }
  public onSelectNeighborhood(){
    this.submitForm.controls.address.get('street').setValue(null, {emitEvent: false}); 
  }

  private setCurrentPosition() {
    if("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => { 
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude; 
      });
    }
  }
  private placesAutocomplete(){  
    this.mapsAPILoader.load().then(() => { 
      let autocomplete = new google.maps.places.Autocomplete(this.addressAutocomplete.nativeElement, {
        types: ["address"]
      });  
      autocomplete.addListener("place_changed", () => { 
        this.ngZone.run(() => { 
          let place: google.maps.places.PlaceResult = autocomplete.getPlace(); 
          if (place.geometry === undefined || place.geometry === null) {
            return;
          };
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng(); 
          this.getAddress();
        });
      });
    });
  } 
  
  // public getAddress(){    
  //   this.mapsAPILoader.load().then(() => {
  //     let geocoder = new google.maps.Geocoder();
  //     let latlng = new google.maps.LatLng(this.lat, this.lng); 
  //     geocoder.geocode({'location': latlng}, (results, status) => {
  //       if(status === google.maps.GeocoderStatus.OK) {
  //         console.log(results); 
  //         //this.addresstext.nativeElement.focus();  
  //         let address = results[0].formatted_address; 
  //         this.submitForm.controls.location.setValue(address); 
  //         this.setAddresses(results[0]);          
  //       }
  //     });
  //   });
  // }
  public getAddress(){    
    this.appService.getAddress(this.lat, this.lng).subscribe(response => {  
      // console.log(response);
      if(response['results'].length){
        let address = response['results'][0].formatted_address; 
        this.submitForm.controls.address.get('location').setValue(address); 
        this.setAddresses(response['results'][0]); 
      } 
    })
  }
  public onMapClick(e:any){
    this.lat = e.coords.lat;
    this.lng = e.coords.lng; 
    this.getAddress();
  }
  public onMarkerClick(e:any){
    // console.log(e);
  }
  
  public setAddresses(result){
    this.submitForm.controls.address.get('city').setValue(null);
    this.submitForm.controls.address.get('zipCode').setValue(null);
    this.submitForm.controls.address.get('street').setValue(null); 

    var newCity, newStreet, newNeighborhood;
    
    result.address_components.forEach(item =>{
      if(item.types.indexOf('locality') > -1){  
        if(this.cities.filter(city => city.name == item.long_name)[0]){
          newCity = this.cities.filter(city => city.name == item.long_name)[0];
        }
        else{
          newCity = { id: this.cities.length+1, name: item.long_name };
          this.cities.push(newCity); 
        }
        this.submitForm.controls.address.get('city').setValue(newCity);    
      }
      if(item.types.indexOf('postal_code') > -1){ 
        this.submitForm.controls.address.get('zipCode').setValue(item.long_name);
      }
    });

    if(!newCity){
      result.address_components.forEach(item =>{
        if(item.types.indexOf('administrative_area_level_1') > -1){  
          if(this.cities.filter(city => city.name == item.long_name)[0]){
            newCity = this.cities.filter(city => city.name == item.long_name)[0];
          }
          else{
            newCity = { 
              id: this.cities.length+1, 
              name: item.long_name 
            };
            this.cities.push(newCity); 
          }
          this.submitForm.controls.address.get('city').setValue(newCity);    
        } 
      });
    }

    if(newCity){
      result.address_components.forEach(item =>{ 
        if(item.types.indexOf('neighborhood') > -1){ 
          let neighborhood = this.neighborhoods.filter(n => n.name == item.long_name && n.cityId == newCity.id)[0];
          if(neighborhood){
            newNeighborhood = neighborhood;
          }
          else{
            newNeighborhood = { 
              id: this.neighborhoods.length+1, 
              name: item.long_name, 
              cityId: newCity.id 
            };
            this.neighborhoods.push(newNeighborhood);
          }
          this.neighborhoods = [...this.neighborhoods];
          this.submitForm.controls.address.get('neighborhood').setValue([newNeighborhood]); 
        }  
      })
    }

    if(newCity){
      result.address_components.forEach(item =>{            
        if(item.types.indexOf('route') > -1){ 
          if(this.streets.filter(street => street.name == item.long_name && street.cityId == newCity.id)[0]){
            newStreet = this.streets.filter(street => street.name == item.long_name && street.cityId == newCity.id)[0];
          }
          else{
            newStreet = { 
              id: this.streets.length+1, 
              name: item.long_name, 
              cityId: newCity.id, 
              neighborhoodId: (newNeighborhood) ? newNeighborhood.id : null 
            };
            this.streets.push(newStreet);
          }          
          this.streets = [...this.streets];
          this.submitForm.controls.address.get('street').setValue([newStreet]); 
        }
      })
    }

  }



   
  // -------------------- Additional ---------------------------  
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

  public buildPriceIncludes(){
    const arr = this.priceIncludes.map(pricein =>{
      return this.fb.group({
        id:pricein.id,
        name:pricein.name,
        selected: pricein.selected
      });
    })
    return this.fb.array(arr);
  }
  
  // setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
  //   console.log(normalizedMonthAndYear);
  //   console.log(datepicker);
    
  //   // const ctrlValue = this.date.value;
  //   // ctrlValue.year(normalizedMonthAndYear);
  //   // ctrlValue.month(normalizedMonthAndYear);
  //   // this.date.setValue(ctrlValue);
  //   // console.log(this.date.value);
    
  //   // datepicker.close();
  // }

  
  // -------------------- Media --------------------------- 
  public createVideo(): FormGroup {
    return this.fb.group({
      id: null,
      name: null, 
      link: null 
    });
  }
  public addVideo(): void {
    const videos = this.submitForm.controls.media.get('videos') as FormArray;
    videos.push(this.createVideo());
  }
  public deleteVideo(index) {
    const videos = this.submitForm.controls.media.get('videos') as FormArray;
    videos.removeAt(index);
  }
  
  public createPlan(): FormGroup {
    return this.fb.group({
      id: null,
      name: null, 
      desc: null,
      area: null,
      rooms: null,
      baths: null,
      image: null
    });
  }
  public addPlan(): void {
    const plans = this.submitForm.controls.media.get('plans') as FormArray;
    plans.push(this.createPlan());
  }
  public deletePlan(index) {
    const plans = this.submitForm.controls.media.get('plans') as FormArray;
    plans.removeAt(index);
  } 


  public createFeature(): FormGroup {
    return this.fb.group({
      id: null,
      name: null, 
      value: null 
    });
  }
  public addFeature(): void {
    const features = this.submitForm.controls.media.get('additionalFeatures') as FormArray;
    features.push(this.createFeature());
  }
  public deleteFeature(index) {
    const features = this.submitForm.controls.media.get('additionalFeatures') as FormArray;
    features.removeAt(index);
  } 


}