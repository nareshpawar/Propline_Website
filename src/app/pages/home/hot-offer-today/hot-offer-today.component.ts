import { Component, OnInit, Input } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-hot-offer-today',
  templateUrl: './hot-offer-today.component.html',
  styleUrls: ['./hot-offer-today.component.scss']
})
export class HotOfferTodayComponent implements OnInit {
  @Input('propertyId') propertyId;
  public property;
  propertyTypes: any;
  furnitureItems: any[];
  amenities: any[];
  flooring: any[];
  overlooking: any[];
  constructor(public appService:AppService) { }

  ngOnInit() {
    // console.log(this.propertyId);
    this.getPropertyTypeController();
    this.appService.getPropertyById(this.propertyId).subscribe(property=>{
      // this.property = property;
      // console.log(property);
      let ele = property.data;
      this.furnitureItems=[];
      this.amenities=[];
      this.flooring = [];
      this.overlooking = [];
      ele.furnished_items.forEach(element => {
        this.furnitureItems.push(element.name)
        
      });
      ele.amenities.forEach(element => {
        this.amenities.push(element.name)
      });
      ele.flooring.forEach(element => {
        this.flooring.push(element.name)
      });

      ele.overlooking.forEach(element => {
        this.overlooking.push(element.name)
      });
      this.property = {
        "id": ele.propertyId,
        "title": ele.society.society,
        "desc": ele.property_desc,
        "propertyType": this.getPropertyName(ele.property_type),
        "propertyStatus": [
          ele.property_for,
        ],
        "age_of_property":ele.age_of_property,
        "city": ele.society.streets.neighborhood.cities.city,
        "zipCode": ele.society.pin,
        "neighborhood": [
          ele.society.streets.neighborhood.neighborhood
        ],
        "street": [
          ele.society.streets.street
        ],
        "location" : {
          "lat": 47.603230,
          "lng": -122.330276
        },
        "formattedAddress": ele.society.location + ',' + ele.society.streets.street + ',' + ele.society.streets.neighborhood.neighborhood + ',' + ele.society.streets.neighborhood.cities.city,
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
        "amenities":this.amenities,
        "featured": true,
        "priceDollar": {
          "sale": ele.price_details.expectedPrice,
          "rent": null
        },
        "priceEuro": {
          "sale": null,
          "rent": null
        },
        "price_details":ele.price_details,
        "bedrooms": ele.property_features.Bedrooms,
        "bathrooms": ele.property_features.bathrooms,
        "Balconies": ele.property_features.Balconies,
        "furnishedStatus": ele.property_features.furnishedStatus,
        "total_floor": ele.property_features.total_floor,
        "floorNo": ele.property_features.floorNo,
        "no_of_towers":ele.property_features.tower,
        "society":ele.society,
        "property_features":ele.property_features,
        "area": {
          "value": ele.property_area.superArea,
          "unit": "Sq-ft"
        },
        "yearBuilt": 2007,
        // "property_posted_on":ele.property_posted_on,
        "ratingsCount": 3,
        "ratingsValue": 280,
        "furnished_items":this.furnitureItems,
        "ownership_status":ele.ownership_status,
        "possession_status":ele.possession_status,
        "property_area":ele.property_area,
        "status_of_water":ele.status_of_water,
        "transaction_type":ele.transaction_type,

        "balcony_list":ele.balcony_list,
        "bedroomsList":ele.bedroomsList,
        "lobby_details":ele.lobby_details,
        "leaving_room_details":ele.leaving_room_details,
        "kitchen_details":ele.kitchen_details,
        "ownerDetails":ele.ownerDetails,
        "gallery":  ele.gallery_media.map(ele => {
          return {
            "small": ele.small,
            "medium": ele.medium,
            "big": ele.big
          }
        }),
        "extra_details": ele.extra_details, 
        "overlooking": this.overlooking,
        "published": ele.property_posted_on,
        "lastUpdate": "2019-05-20 14:20:00",
        "views": 408,
        "completionDocs":ele.completionDocs,
        "documentList":ele.documentList,
        "otherDocs":ele.otherDocs,
        "bankDocs":ele.bankDocs,
        "societyRegCertificate":ele.societyRegCertificate
      };
      
    }) 
  }

  getPropertyName(id){
    // console.log();
    
    let PropertyData =this.propertyTypes.find(item => item.property_type_id == id);
    return  PropertyData.property_name;
  }

  notifier = new Subject();
  getPropertyTypeController() {
    this.appService.getPropertyTypeController().pipe(takeUntil(this.notifier)).subscribe((res: any) => {
      this.propertyTypes = res.data;
      // console.log(res.data);

    })
  }

}
