import { Component, OnInit, ViewChild, HostListener, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Property } from 'src/app/app.models';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppSettings, Settings } from 'src/app/app.settings';
import { CompareOverviewComponent } from 'src/app/shared/compare-overview/compare-overview.component';
import { EmbedVideoService } from 'ngx-embed-video'; 
import { emailValidator } from 'src/app/theme/utils/app-validators';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;  
  @ViewChildren(SwiperDirective) swipers: QueryList<SwiperDirective>;
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation:true
  };
  public sidenavOpen:boolean = true;
  public config: SwiperConfigInterface = {}; 
  public config2: SwiperConfigInterface = {}; 
  private sub: any;
  public property:any; 
  public settings: Settings;  
  public embedVideo: any;
  public relatedProperties: any;
  // public featuredProperties: Property[];
  public agent:any;
  public mortgageForm: FormGroup;
  public monthlyPayment:any;
  public contactForm: FormGroup;
  overlooking: any[];
  propertyTypes: any;
  amenities: any[];
  furnitureItems: any[];
  flooring: any[];
  cardDetails: any;
  property_area: any;
  statusOfWaterAndElectricity: {};
  ownerDetails: any;
  dto: any;
  poaOwner: any;
  constructor(public appSettings:AppSettings, 
              public appService:AppService, 
              private activatedRoute: ActivatedRoute, 
              private embedService: EmbedVideoService,
              public fb: FormBuilder,) {
    this.settings = this.appSettings.settings; 
  }

  ngOnInit() {
    // setTimeout(()=>{                          
      this.getPropertyTypeController();
  // }, 100);
    this.getRelatedProperties();
    // this.getFeaturedProperties();
    this.getAgent(1);
    if(window.innerWidth < 960){
      this.sidenavOpen = false;
      if(this.sidenav){
        this.sidenav.close();
      } 
    };
    this.mortgageForm = this.fb.group({
      principalAmount: ['', Validators.required],
      downPayment: ['', Validators.required], 
      interestRate: ['', Validators.required],
      period: ['', Validators.required]
    });
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phone: ['', Validators.required],
      message: ['', Validators.required]
    });
  } 

  getCardDetails(id){
    this.appService.getCardDetails(id).subscribe(res=>{
      this.cardDetails = res?.data?.map((ele)=>{
          return {
            "card_number" : ele.card_number,
            "card":ele
          }
    })
    // console.log( this.cardDetails);
    
    })
    
}
  ngOnDestroy() {
    this.sub.unsubscribe();
  }  

  @HostListener('window:resize')
  public onWindowResize():void {
    (window.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true; 
  }
 

  public getPropertyById(id){
    // this.appService.getPropertyById(id).subscribe(data=>{
      
    //   this.property = data;  
    //   this.embedVideo = this.embedService.embed(this.property.videos[1].link);
    //   setTimeout(() => { 
    //     this.config.observer = true;
    //     this.config2.observer = true; 
    //     this.swipers.forEach(swiper => { 
    //       if(swiper){
    //         swiper.setIndex(0);
    //       } 
    //     }); 
    //   });
    // });
    this.appService.getPropertyById(id).subscribe(res => {
      let ele = res.data;
      let propertyType;
      // console.log(ele);
      
      if(ele.propertyId){
        propertyType = this.getPropertyType(ele.property_type);
      }
      this.furnitureItems=[];
      this.amenities=[];
      this.flooring = [];
      this.overlooking = [];
      if(propertyType === 'Residential'){
        ele?.furnished_items?.forEach(element => {
          if(element.selected){
          this.furnitureItems.push(element.name)
          }
        });
        
        
        ele.amenities?.forEach(element => {
          if(element.selected){
          this.amenities.push(element.name)
          }
        });
        ele.flooring?.forEach(element => {
          if(element.selected){
          this.flooring.push(element.name)
          }
        });
        ele.overlooking?.forEach(element => {
          if(element.selected){
            
            this.overlooking.push(element.name)
          }
        });

        this.property = {
          "id": ele.propertyId,
          "paroperty_name": ele.property_name,
          "title": ele.society.society,
          "desc": ele.property_desc,
          "propertyType": this.getPropertyName(ele.property_type),
          "propertyStatus": [
            ele.property_for,
          ],
          "age_of_property": ele.age_of_property,
          "city": ele.society.streets.neighborhood.cities.city,
          "zipCode": ele.society.pin,
          "neighborhood": [
            ele.society.streets.neighborhood.neighborhood
          ],
          "street": [
            ele.society.streets.street
          ],
          "location": {
            "lat": 33.95422,
            "lng": -118.29373
          },
          "formattedAddress":  ele.society.streets.street + ',' + ele.society.streets.neighborhood.neighborhood + ',' + ele.society.streets.neighborhood.cities.city, //ele.society.location + ',' +
          "features": [
            "Air Conditioning",
            "Barbeque",
            "Dryer",
            "Microwave",
            "Refrigerator",
            "Fireplace",
            "Sauna",
            "TV Cable",
            "WiFi"
          ],
          "amenities": this.amenities,
          "featured": true,
          "priceDollar": {
            "sale":ele.price_details.expectedPrice !== '' ? Number(ele.price_details.expectedPrice) : Number(ele.commercial_details.expectedPrice),
            "rent": null
          },
          "priceEuro": {
            "sale": null,
            "rent": null
          },
          "price_details": ele.price_details,
          "bedrooms": ele.property_features.Bedrooms,
          "bathrooms": ele.property_features.bathrooms,
          "Balconies": ele.property_features.Balconies,
          "furnishedStatus": ele?.property_features?.furnishedStatus !==''? ele?.property_features?.furnishedStatus : ele?.commercial_details?.furnishedStatus,
          "total_floor": ele.property_features.total_floor,
          "floorNo": ele.property_features.floorNo,
          "no_of_towers": ele.property_features.tower,
          "society": ele.society,
          "property_features": ele.property_features,
          "area": {
            "value": ele.property_area.superArea,
            "unit": "Sq-ft"
          },
          "yearBuilt": 2007,
          // "property_posted_on":ele.property_posted_on,
          "ratingsCount": 3,
          "ratingsValue": 280,
          "furnished_items": this.furnitureItems,
          "ownership_status": ele.ownership_status,
          "possession_status": ele.possession_status,
          "property_area": ele.property_area,
          "status_of_water": ele.status_of_water,
          "transaction_type": ele.transaction_type,
  
          "balcony_list": ele.balcony_list,
          "bedroomsList": ele.bedroomsList,
          "lobby_details": ele.lobby_details,
          "leaving_room_details": ele.leaving_room_details,
          "kitchen_details": ele.kitchen_details,
          "ownerDetails": ele.ownerDetails,
          "gallery": ele?.gallery_media?.map(ele => {
            return {
              "small": ele?.small,
              "medium": ele?.medium,
              "big": ele?.big
            }
          }) ,
          "extra_details": ele.extra_details,
          "overlooking": this.overlooking,
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
          "published": ele.property_posted_on,
          "lastUpdate": "2019-05-20 14:20:00",
          "views": 408,
          "completionDocs": ele.completionDocs,
          "documentList": ele.documentList,
          "otherDocs": ele.otherDocs,
          "bankDocs": ele.bankDocs,
          "societyRegCertificate": ele.societyRegCertificate,
          "commercial_details": ele.commercial_details,
          "commercial_extra":ele.commercial_extra
  
        };
      }else if(propertyType === 'Commercial'){
        let price_details = {
          "expectedPrice": ele?.commercial_details?.expectedPrice,
          "pricePerSqft": ele?.commercial_details?.expectedPricePerSqft,
          "brokerageIncluded": ele?.commercial_details?.bookingOrTokenAmount,
          "maintenenceCharges": ele?.commercial_details?.maintenenceCharges,
          "maintenenceChargesPerYear": ele?.commercial_details?.maintenenceChargesPerYear,
          "brokerage":  ele?.commercial_details?.brokerage,
          "OtherCharges": ele?.commercial_details?.otherCharges,
          "priceIncludes": ele?.commercial_details?.priceIncludes,
          "stampDuty": 0,
          "stampIncluded": 0,
          "regCharge": 0,
          "finalPrice": 0,
  
        }
        ele.furnished_items?.forEach(element => {
          if(element.selected){
          this.furnitureItems.push(element.name)
          }
        });
        
        
        ele?.commercial_extra?.amenities?.forEach(element => {
          if(element.selected){
          this.amenities.push(element.name)
          }
        });
        ele?.commercial_extra?.flooring?.forEach(element => {
          if(element.selected){
          this.flooring.push(element.name)
        }
        });
        ele?.commercial_extra?.overlooking?.forEach(element => {
          if(element.selected){
            this.overlooking.push(element.name)
          }
        });

        // this.property_area.push(  );
        // this.property_area.push();

        // this.property_area.push();
        // this.property_area.push(); 
        // // this.property_area.push(ele?.commercial_extra?.plotLength    );
        // // this.property_area.push(ele?.commercial_extra?.plotBreadth   );  
        // this.property_area.push();      
        // this.property_area.push();  
        
        // this.property_area.push();       
        // this.property_area.push();    

        this.property_area = {
          
          "coverdArea":ele?.commercial_details?.coverdArea,
          "coveredMessure":ele?.commercial_details?.coveredMessure,
          "plotArea":ele?.commercial_details?.plotArea,
          "plotMessure":ele?.commercial_details?.plotMessure,
          "builtUpArea": ele?.commercial_details?.builtUpArea,
          "built_major": ele?.commercial_details?.built_major,
          "carpetArea": ele?.commercial_details?.carpetArea,
          "carpet_major": ele?.commercial_details?.carpetMessure,
        }


        this.statusOfWaterAndElectricity = {
          electricityStatus: ele?.commercial_extra?.statusElectricity,
          waterAvailability: ele?.commercial_extra?.availabilityWater,
        }

        // this.transactionType= 
        let transactionType;
        ele?.commercial_details?.transactionType.forEach(element => {
          if (element.selected === true) {
            transactionType = element.name;
          }
        });

        let extraDetails  = {
          Convenience: 'NA',
          approvedBy :'NA',
          coOperative: 'NA',
          facing: ele?.commercial_extra?.facing,
          covered:ele?.commercial_extra?.carParking[0]?.selected,
          input_covered:ele?.commercial_extra?.carParking[0]?.unit,
          open:ele?.commercial_extra?.carParking[1]?.selected,
          input_open:ele?.commercial_extra?.carParking[1]?.unit,
          landmarkNeighbourhood: ele?.extra_details?.landmarkNeighbourhood,
          teUsMore:ele?.extra_details?.teUsMore
        } 

        this.property = {
          "id": ele?.propertyId,
          "paroperty_name": ele?.property_name,
          "title": ele?.society.society,
          "desc": ele?.commercial_extra?.Description,
          "propertyType": this.getPropertyName(ele.property_type),
          "propertyStatus": [
            ele.property_for,
          ],
          "age_of_property": ele?.commercial_details?.ageOfProperty,
          "city": ele.society.streets.neighborhood.cities.city,
          "zipCode": ele.society.pin,
          "neighborhood": [
            ele.society.streets.neighborhood.neighborhood
          ],
          "street": [
            ele.society.streets.street
          ],
          "location": {
            "lat": 33.95422,
            "lng": -118.29373
          },
          "formattedAddress": ele.society.streets.street + ',' + ele.society.streets.neighborhood.neighborhood + ',' + ele.society.streets.neighborhood.cities.city,//ele.society.location + ',' + 
          "amenities": this.amenities,
          "featured": true,
          "priceDollar": {
            "sale": ele?.commercial_details?.expectedPrice,
            "rent": null
          },
          "price_details": price_details,
          "bedrooms": "NA",
          "bathrooms": "NA",
          "Balconies": "NA",
          "furnishedStatus": ele?.commercial_details?.furnishedStatus,
          "total_floor": ele?.commercial_details?.totalFoors,
          "floorNo": ele?.commercial_details?.floorNo,
          "no_of_towers": "NA",
          "society": ele.society,
          "property_features": ele.property_features,
          "area": {
            "value":  this.property_area.plotArea,
            "unit": this.property_area.plotMessure
          },
          // "yearBuilt": 2007,
          // "property_posted_on":ele.property_posted_on,
          // "ratingsCount": 3,
          // "ratingsValue": 280,
          "furnished_items": this.furnitureItems,
          "ownership_status": ele?.commercial_extra?.ownershipStatus,
          "possession_status": ele?.commercial_details?.possessionStatus,
          "property_area": this.property_area,
          "status_of_water": this.statusOfWaterAndElectricity,
          "transaction_type": transactionType,
  
          "balcony_list": "NA",
          "bedroomsList": "NA",
          "lobby_details": "NA",
          "leaving_room_details": "NA",
          "kitchen_details": "NA",
          "ownerDetails": ele.ownerDetails,
          "gallery":  ele?.gallery_media?.map(ele => {
            return {
              "small": ele.small,
              "medium": ele.medium,
              "big": ele.big
            }
          }),
          "extra_details": extraDetails,
          "overlooking": this.overlooking,
          // "plans": [
          //   {
          //     "name": "First floor",
          //     "desc": "Plan description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium magnam veniam sit reprehenderit deserunt ad voluptates id aperiam veritatis! Nobis saepe quos eveniet numquam vitae quis, tenetur consectetur impedit dolore.",
          //     "area": {
          //       "value": 1180,
          //       "unit": "Sq-ft"
          //     },
          //     "rooms": 3,
          //     "baths": 1,
          //     "image": "assets/images/others/plan-1.jpg"
          //   },
          //   {
          //     "name": "Second floor",
          //     "desc": "Plan description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium magnam veniam sit reprehenderit deserunt ad voluptates id aperiam veritatis! Nobis saepe quos eveniet numquam vitae quis, tenetur consectetur impedit dolore.",
          //     "area": {
          //       "value": 1200,
          //       "unit": "Sq-ft"
          //     },
          //     "rooms": 5,
          //     "baths": 2,
          //     "image": "assets/images/others/plan-2.jpg"
          //   }
          // ],
          // "videos": [
          //   {
          //     "name": "Video",
          //     "link": "http://themeseason.com/data/videos/video-1.mp4"
          //   },
          //   {
          //     "name": "Video with 'ngx-embed-video' plugin",
          //     "link": "https://www.youtube.com/watch?v=-NInBEdSvp8"
          //   }
          // ],
          "published": ele.property_posted_on,
          "lastUpdate": "2019-05-20 14:20:00",
          // "views": 408,
          "completionDocs": ele.completionDocs,
          "documentList": ele.documentList,
          "otherDocs": ele.otherDocs,
          "bankDocs": ele.bankDocs,
          "societyRegCertificate": ele.societyRegCertificate,
          "shopNo":ele?.commercial_details?.shopNo,
          "commercial_details":ele?.commercial_details,
          "commercial_extra": ele?.commercial_extra
        };
      }
      if (ele?.covered_image !== null && ele?.covered_image !== undefined) {
        this.property?.gallery?.unshift({
          "small": ele?.covered_image?.Small,
          "medium": ele?.covered_image?.Medium,
          "big": ele?.covered_image?.Big
        })
      }
    })
  }
  notifier = new Subject();
  getPropertyTypeController() {
    this.appService.getPropertyTypeController().pipe(takeUntil(this.notifier)).subscribe((res: any) => {
      this.propertyTypes = res.data;
      // console.log(res.data);
      this.sub = this.activatedRoute.params.subscribe(params => {   
        this.getCardDetails(params['id']);
        this.getPropertyById(params['id']); 
        this.getActivity(params['id']);
      });
      // this.getPropertyName(1);
    })
  }
  getPropertyType(id){
    let PropertyData = this.propertyTypes?.find(item => item.property_type_id == id);
    return PropertyData?.property_name;
  }
  getPropertyName(id){
    let PropertyData =this.propertyTypes?.find(item => item.property_type_id == id);
    return  PropertyData.property_name;
  }
  ngAfterViewInit(){
    this.config = {
      observer: false,
      slidesPerView: 1,
      spaceBetween: 0,       
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,        
      loop: false,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      }
    };

    this.config2 = {
      observer: false,
      slidesPerView: 4,
      spaceBetween: 16,      
      keyboard: true,
      navigation: false,
      pagination: false, 
      grabCursor: true,       
      loop: false, 
      preloadImages: false,
      lazy: true,  
      breakpoints: {
        200: {
          slidesPerView: 2
        },
        480: {
          slidesPerView: 3
        },
        600: {
          slidesPerView: 4
        } 
      }
    } 
  }
  public onOpenedChange(){ 
    this.swipers?.forEach(swiper => { 
      if(swiper){
        swiper.update();
      } 
    });     
  }
  public selectImage(index:number){ 
    this.swipers.forEach(swiper => {
      if(swiper['elementRef'].nativeElement.id == 'main-carousel'){
        swiper.setIndex(index);
      }      
    }); 
  }
  public onIndexChange(index: number) {  
    this.swipers?.forEach(swiper => { 
      let elem = swiper['elementRef'].nativeElement;
      if(elem.id == 'small-carousel'){
        swiper.setIndex(index);  
        for (let i = 0; i < elem.children[0].children.length; i++) {
          const element = elem.children[0].children[i]; 
          if(element.classList.contains('thumb-'+index)){
            element.classList.add('active-thumb'); 
          }
          else{
            element.classList.remove('active-thumb'); 
          }
        }
      } 
    });     
  }
  // public addToCompare(){
  //   this.appService.addToCompare(this.property, CompareOverviewComponent, (this.settings.rtl) ? 'rtl':'ltr'); 
  // }
  public onCompare(){
    return this.appService.Data.compareList.filter(item=>item.id == this.property.id)[0];
  }
  // public addToFavorites(){
  //   this.appService.addToFavorites(this.property, (this.settings.rtl) ? 'rtl':'ltr');
  // }
  public onFavorites(){
    return this.appService.Data.favorites.filter(item=>item.id == this.property.id)[0];
  }
  public getRelatedProperties(){
    this.appService.getRelatedProperties().subscribe(properties=>{
      this.relatedProperties = properties;
    })
  }
  // public getFeaturedProperties(){
  //   this.appService.getFeaturedProperties().subscribe(properties=>{
  //     this.featuredProperties = properties.slice(0,3); 
  //   })
  // } 
  public getAgent(agentId:number = 1){
    var ids = [1,2,3,4,5]; //agent ids 
    agentId = ids[Math.floor(Math.random()*ids.length)]; //random agent id
    this.agent = this.appService.getAgents().filter(agent=> agent.id == agentId)[0]; 
  }
  public onContactFormSubmit(values:Object){
    if (this.contactForm.valid) { 
      // console.log(values);
    } 
  }
  public onMortgageFormSubmit(values:Object){ 
    if (this.mortgageForm.valid) { 
      var principalAmount = values['principalAmount']
      var down = values['downPayment']
      var interest = values['interestRate']
      var term = values['period']
      this.monthlyPayment = this.calculateMortgage(principalAmount, down, interest / 100 / 12, term * 12).toFixed(2);
    }     
  }
  public calculateMortgage(principalAmount:any, downPayment:any, interestRate:any, period:any){    
    return ((principalAmount-downPayment) * interestRate) / (1 - Math.pow(1 + interestRate, -period));
  } 

  getActivity(id) {
    this.appService.getactivity(id).subscribe(res => {
      this.ownerDetails = res.data;
      res.data?.forEach(ele => {
          this.dto = ele.owner.ownerDto,
          this.poaOwner = ele.owner.poa_owner_details
      })
      // this.tenentbyOwner = this.getTenentFromOwenrId(this.ownerDetails[0]?.owner?.owner_id);
    })
  }

}