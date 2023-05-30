import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { API } from '../services/ip.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private httpClient: HttpClient;
  tokenS: string = '';
  headers: any ;
  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
    this.tokenS = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.cDoKZ7qBMm9DDOX9XIEC8C8_4MzVBblBX_LRfLshU2E';
    this.headers = new HttpHeaders();
    this.headers = this.headers.set('Authorization', this.tokenS ).set('observe', 'response' );
  }



  getMethod(url: string): Observable<any> {
    return this.httpClient.get(url, { headers:this.headers});
  }

  postMethod(url: string, body?: any) {
    return this.httpClient.post(`${url}`, body, { observe: 'response' });
  }

  patchMethod(url: string, body?: any) {
    return this.httpClient.patch(`${url}`, body, { observe: 'response' });
  }

  putMethod(url: string, body?: any) {
    return this.httpClient.put(`${url}`, body, { observe: 'response' });
  }

  deleteMethod(url: string) {
    return this.httpClient.delete(`${url}`, { observe: 'response' });
  }
}
