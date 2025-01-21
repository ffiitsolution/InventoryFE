import { Injectable } from '@angular/core';
import { Client, Stomp, StompConfig, StompSubscription } from '@stomp/stompjs';
import { DataService } from './data.service';
// import SockJS from 'sockjs-client';
import * as SockJS from 'sockjs-client';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient: Client | undefined;
  private initializedPromise: Promise<void> | undefined;
  private subscriptions: { [destination: string]: StompSubscription } = {};
  connectedCount: number = 0;

  constructor(
    public g: GlobalService
  ) {}

  isWebSocketConnected(): boolean {
    return !!this.stompClient && this.stompClient.connected;
  }

  initializeWebSocketConnection(): Promise<void> {
    if (this.initializedPromise) {
      return this.initializedPromise;
    }

    const urlWs = this.g.urlServer + '/ws';

    this.stompClient = new Client({
      brokerURL: urlWs.replace('http', 'ws').replace('https', 'wss'),
    });

    this.initializedPromise = new Promise<void>((resolve, reject) => {
      this.stompClient!.onConnect = (frame: any) => {
        this.connectedCount++;
        this.stompClient!.reconnectDelay = 3000;
        console.log('Connected to WebSocket: x' + this.connectedCount++);
        if (this.connectedCount > 1) {
          this.g.executeFunction('WS_SUBSCRIBE');
        }
        resolve();
      };
      this.stompClient!.onWebSocketClose = (state) => {
        console.log('Connection closed.');
      };
      this.stompClient!.onWebSocketError = (error: any) => {
        console.error('WebSocket connection failed.');
        reject(error);
      };
      this.stompClient!.connectionTimeout = 2000;
    });
    this.stompClient.activate();

    window.addEventListener('beforeunload', () => {
      this.stompClient!.deactivate();
    });

    return this.initializedPromise;
  }

  subscribe(
    destination: string,
    callback: (message: string) => void
  ): StompSubscription | undefined {
    if (!this.isWebSocketConnected()) {
      console.error('WebSocket is not connected.');
      return undefined;
    }
    if (this.stompClient) {
      return this.stompClient.subscribe(destination, (message: any) => {
        callback(message.body);
      });
    } else {
      console.error('Stomp client is not initialized.');
      return undefined;
    }
  }

  unsubscribe(destination: string): void {
    if (!this.isWebSocketConnected()) {
      console.error('WebSocket is not connected.');
      return;
    }
    if (this.stompClient) {
      this.stompClient.unsubscribe(destination);
    } else {
      console.error('Stomp client is not initialized.');
    }
  }

  sendMessage(destination: string, message: string): void {
    if (!this.isWebSocketConnected()) {
      console.error('WebSocket is not connected.');
      return;
    }
    console.log('sendMessage to ' + destination + ' | Content: ' + message);
    if (this.stompClient) {
      this.stompClient.publish({ destination: destination, body: message });
    } else {
      console.error('Stomp client is not initialized.');
    }
  }
}
