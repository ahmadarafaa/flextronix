import { Injectable } from '@angular/core';
declare var require: any;
const Stomp = require('stompjs/lib/stomp.js').Stomp
import * as SockJS from 'sockjs-client';
import { API } from './ip.service';

@Injectable()
export class WebSocketService {

  // Open connection with the back-end socket
  public connect() {
    const chartsSocket = new SockJS(API().chartsWebSocket);
    const chartsStompClient = Stomp.over(chartsSocket);
    const protocol = window.location.protocol.replace('http', 'ws');
    return chartsStompClient;
  }
}
