import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as leaflet from 'leaflet';
import { AppService } from '../../service/app.service';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Point } from './map.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() routeNo: string = '';
  private points: leaflet.LatLngExpression[] = [];
  private rawPointsResponse: [];
  private mapArr!: leaflet.Map;
  downloadingMap: boolean = false;

  constructor(
    private appService: AppService,
    private toastr: ToastrService
  ) { }
  ngOnInit(): void {
    this.downloadingMap = true;
  }

  async ngAfterViewInit() {
    const result = await lastValueFrom(this.appService.getRoutePoints(this.routeNo));
    if (result.success && !!result.data) {
      this.rawPointsResponse = result.data.detail;
      const transformPoint = result.data.detail.map((item: Point) => [
        Number(item.latitude), Number(item.longitude)
      ])
      this.points = transformPoint;
      this.initMap();
    } else {
      this.toastr.error(result.message);
    }
    this.downloadingMap = false;
  }

  initMap(): void {
    this.mapArr = leaflet.map('map').setView(this.points[0], 6);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.mapArr);

    this.points.forEach((point, index) => {
      const marker = leaflet.marker(point as leaflet.LatLngExpression).addTo(this.mapArr);

      const popup = leaflet.popup({
        closeButton: false,
        autoClose: false,
        closeOnClick: false
      })
        .setLatLng(point)
        .setContent(`Point ${index + 1}`);

      marker.bindPopup(popup).openPopup();
    });

    const bounds = leaflet.latLngBounds(this.points);
    this.mapArr.fitBounds(bounds);
  }
}
