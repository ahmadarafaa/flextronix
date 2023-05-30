import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { SettingsService } from '@core';
import { Subscription } from 'rxjs';
import Chart from 'chart.js/auto';
import { DashboardService } from './dashboard.service';
import { WebSocketService } from '@shared/services/websocket.service';
import { API } from '@shared/services/ip.service';
import { MainService } from '@shared/services/main.service';
/**
 * @title Basic cards
 */

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardService],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  machineList: any = [];
  series: any = [];
  labels: any = [];
  stats: any = [];
  intervalId: any;
  options = {
    title: {
      display: true,
      text: 'My Title',
      fontSize: 16,
    },
    legend: {
      position: 'bottom',
      onClick: (e: any) => e.stopPropagation(),
    },
    tooltips: {
      enabled: true,
      mode: 'nearest',
      intersect: false,
      callbacks: {
        label: (tooltipItem: any, data: any) => {
          let label = data.datasets[tooltipItem.datasetIndex].label || '';
          let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          let percentage = value.toFixed(2) + '%';
          //return `${label}: ${value} %`;
          return `${label}: ${value} (${percentage})`;
        }
      }
    }
  };
  notifySubscription!: Subscription;
  data: any;
  dataList: any = [];
  totalMachines = 0;
  totalProductions = 0;
  totalWaste = 0;
  productionPercentage: number = 0;
  wastePercentage: number = 0;

  constructor(
    private ngZone: NgZone,
    private dashboardSrv: DashboardService,
    private webSocketService: WebSocketService,
    private service: MainService,
    private settings: SettingsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.dataList = [];
    //  [{
    //   chart: {
    //   labels: ['No data avaliable'],
    //   datasets: [
    //       {
    //           data: [0.001],
    //           backgroundColor: [
    //               "#FF6384",
    //               "#36A2EB",
    //               "#FFCE56"
    //           ],
    //           hoverBackgroundColor: [
    //               "#FF6384",
    //               "#36A2EB",
    //               "#FFCE56"
    //           ]
    //       }]
    //   },
    //   name : ''
    // }
    // ];
  }

  ngOnInit() {
    this.loadChartsData();
    this.notifySubscription = this.settings.notify.subscribe((res: any) => {
      console.log(res);
    });
    this.intervalId = setInterval(() => {
      this.loadChartsData();
    }, 10000);
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.initChart());
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.notifySubscription.unsubscribe();
  }

  initChart() {}

  loadChartsData() {
    this.service.getMethod(API().getChartsData).subscribe((res: any) => {
      console.log(res);
      this.machineList = [];
      for (const [key, value] of Object.entries(res)) {
        if (this.machineList.filter((element: any) => element.name == key))
          this.machineList.push({ name: key, data: value });
      }
      console.log(this.machineList);
      this.dataList = [];
      this.totalMachines = 0;
      this.totalProductions = 0;
      this.totalWaste = 0
      this.machineList.forEach((machine: any, index: any) => {
        this.series = [];
        this.labels = [];
        machine.data.forEach((data: any) => {
          if (data.Name == 'Production') {
            this.totalProductions += data.Value;
          } else {
            this.totalWaste += data.Value;
          }
          // this.series.push(data.Value);
          this.labels.push(data.Name);
          let total = this.totalProductions + this.totalWaste;
          this.productionPercentage = (this.totalProductions / total) * 100;
          this.wastePercentage = (this.totalWaste / total) * 100;
        });
        console.log(machine.data);
        let chartData = {
          chart: {
            labels: this.labels,
            datasets: [
              {
                data: [this.productionPercentage, this.wastePercentage],
                backgroundColor: ['#50C878', '#FF0000', '#FFCE56'],
                hoverBackgroundColor: ['#50C878', '#FF0000', '#FFCE56'],
              },
            ],
          },
          name: machine.name,
        };
        console.log(this.dataList);

        this.dataList.push(chartData);
      });
      this.totalMachines = this.machineList.length;
      this.stats = [
        {
          title: 'Total Machines',
          amount: this.totalMachines,
          color: 'bg-indigo-500',
        },
        {
          title: 'Total Production',
          amount: this.totalProductions,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Waste',
          amount: this.totalWaste,
          color: 'bg-green-500',
        },
      ];
      this.changeDetectorRef.detectChanges();
    });

    console.log(this.dataList);
  }

  openWebSocketForCharts() {
    const stompClient = this.webSocketService.connect();
    stompClient.connect({}, (frame: any) => {});
  }
}
