import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderShowServiceService {
  headerFlag = new Subject<boolean>();
  constructor() { }
}
