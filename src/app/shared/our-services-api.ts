import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OurServicesApi {
  // private baseUrl: string = 'http://appserver.preownedproperties.in:8080/pop-dev/api/';
  public baseUrl = environment.baseUrl;
  private ourserviceListApi = this.baseUrl + '/services';
  private missionServiceListApi = this.baseUrl + '/mission';
  constructor(private http: HttpClient) { }

  getServiceList(): Observable<any> {
    return this.http.get(this.ourserviceListApi);
  }

  getMissionservices(): Observable<any> {
    return this.http.get(this.missionServiceListApi);
  }

}