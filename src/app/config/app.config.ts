import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from './app-config.model';

@Injectable()
export class AppConfig {
  static settings: IAppConfig;
  constructor(private http: HttpClient) { }
  load() {
    const jsonFile = '../../assets/config/config.dev.json';
    return new Promise<void>((resolve, reject) => {
      this.http
        .get(jsonFile)
        .toPromise()
        .then((response: any) => {
          AppConfig.settings = <IAppConfig>response;
          resolve();
        })
        .catch((response: any) => {
          reject(
            `Could not load app configuration file '${jsonFile}': ${JSON.stringify(
              response
            )}`
          )
        })
    });
  }
  BASE_URL: string = 'http://localhost:8093/inventory/api';
}
