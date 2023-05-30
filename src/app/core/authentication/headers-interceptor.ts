import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from 'rxjs';


@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

    tokenS: string = ''
    // requestId: string = '';

    constructor() {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {

        console.log('token added')

        this.tokenS = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.cDoKZ7qBMm9DDOX9XIEC8C8_4MzVBblBX_LRfLshU2E'

        const modifiedRequest = req.clone({

            setHeaders: {

                'Authorization': `Bearer ${this.tokenS}`,

                'Content-Type': 'application/json',
            }

        });

        return next.handle(modifiedRequest)

    }
}
