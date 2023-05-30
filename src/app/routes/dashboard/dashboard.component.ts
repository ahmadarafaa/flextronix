import { ViewChildren, QueryList } from '@angular/core';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, NgZone, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@core';
import { Subscription } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { WebSocketService } from '@shared/services/websocket.service';
import { API } from '@shared/services/ip.service';
import { MainService } from '@shared/services/main.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardService],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  machineList: any = [];
  stats: any = [];
  intervalId: any;
  dataList: any[] = [];
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
  ) {}

  ngOnInit() {
    this.loadChartsData();
    this.intervalId = setInterval(() => {
      this.loadChartsData();
    }, 10000);
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.initChart());
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  initChart() {
    // Initialize the chart if needed
  }

  loadChartsData() {
    this.service.getMethod(API().getChartsData).subscribe((res: any) => {
      this.machineList = [];
      for (const [key, value] of Object.entries(res)) {
        if (!this.machineList.some((element: any) => element.name === key))
          this.machineList.push({ name: key, data: value });
      }

      this.totalMachines = 0;
      this.totalProductions = 0;
      this.totalWaste = 0;
      this.machineList.forEach((machine: any) => {
        let totalProductions = 0;
        let totalWaste = 0;
        machine.data.forEach((data: any) => {
          if (data.Name === 'Production') {
            totalProductions += data.Value;
          } else {
            totalWaste += data.Value;
          }
        });
        this.totalProductions += totalProductions;
        this.totalWaste += totalWaste;
        this.totalMachines++;

        const productionPercentage = totalProductions !== 0 ? (totalProductions / (totalProductions + totalWaste)) * 100 : 0;
        const wastePercentage = totalWaste !== 0 ? (totalWaste / (totalProductions + totalWaste)) * 100 : 0;

        const chartData = this.dataList.find(cd => cd.name === machine.name);
        if (chartData) {
          chartData.chart.datasets[0].data = [productionPercentage, wastePercentage];
          chartData.options.title.text = machine.name;
        } else {
          const newChartData = {
            chart: {
              labels: ['Production', 'Waste'],
              datasets: [
                {
                  data: [productionPercentage, wastePercentage],
                  backgroundColor: ['#50C878', '#FF0000'],
                  hoverBackgroundColor: ['#50C878', '#FF0000'],
                },
              ],
            },
            options: {
              title: {
                display: true,
                text: machine.name,
                fontSize: 16,
              },
              legend: {
                labels: {
                  generateLabels(chart: any) {
                    return chart.data.datasets[0].data.map(function(data: any, index: any) {
                      const label = chart.data.labels[index];
                      const value = chart.data.datasets[0].data[index];
                      const percentage = value.toFixed(2) + '%';
                      return {
                        text: `${label}: ${value} ${percentage}`,
                        fillStyle: chart.data.datasets[0].backgroundColor[index],
                        strokeStyle: chart.data.datasets[0].hoverBackgroundColor[index],
                        lineWidth: 2,
                        hidden: isNaN(data) || chart.getDatasetMeta(0).data[index].hidden,
                        index,
                      };
                    });
                  },
                },
              },
              tooltips: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                callbacks: {
                  label(tooltipItem: any, data: any) {
                    const label = data.labels[tooltipItem.index];
                    const value = data.datasets[0].data[tooltipItem.index];
                    const percentage = value.toFixed(2) + '%';
                    return `${label}: ${percentage}`;
                  },
                },
              },
              plugins: {
                datalabels: {
                  color: '#000',
                  font: {
                    weight: 'bold',
                    size: 14,
                  },
                  formatter(value: any, context: any) {
                    const label = context.chart.data.labels[context.dataIndex];
                    const percentage = value.toFixed(2) + '%';
                    return `${label}: ${percentage}`;
                  },
                  //anchor: 'end',
                  //align: 'start',
                },
              },
            },
            name: machine.name,
          };

          this.dataList.push(newChartData);
        }
      });

      this.stats = [
        { title: 'Total Machines', amount: this.totalMachines, color: 'bg-indigo-500' },
        { title: 'Total Production', amount: this.totalProductions, color: 'bg-blue-500' },
        { title: 'Total Waste', amount: this.totalWaste, color: 'bg-green-500' },
      ];
      this.changeDetectorRef.detectChanges();

      this.charts.forEach((chart: BaseChartDirective) => chart.update());
    });
  }
}

