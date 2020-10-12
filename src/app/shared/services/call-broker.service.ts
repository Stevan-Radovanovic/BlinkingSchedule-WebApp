import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BusinessObject } from '../models/business-object.model';
import { ResponseObject } from '../models/response-object.model';
import { RouteConstantsService } from './route-constants.service';

@Injectable({
  providedIn: 'root',
})
export class CallBrokerService {
  constructor(
    private http: HttpClient,
    private routes: RouteConstantsService
  ) {}

  login(username: string, password: string) {
    const body = {
      username,
      password,
    };
    return this.http.post<ResponseObject>(this.routes.login, body);
  }

  getAllBusinesses() {
    return this.http.get<ResponseObject>(this.routes.getAllBusinesses);
  }

  getBusinessById(businessId: number) {
    const body = {
      businessId,
    };
    return this.http.post<ResponseObject>(this.routes.getBusinessById, body);
  }

  getImageById(imageId: string) {
    return this.routes.getImageById + imageId;
  }

  addNewBusiness(business: BusinessObject) {
    const body = {
      ...business,
    };

    return this.http.post<ResponseObject>(this.routes.addNewBusiness, body);
  }
}
