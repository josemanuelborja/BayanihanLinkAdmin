import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  viewChild
} from '@angular/core';
import type ApexCharts from 'apexcharts';

import { DashboardChartFilterComponent, DashboardChartPeriod } from '../dashboard-chart-filter.component';
import { buildRequestsByDisasterTypeOptions } from './requests-by-disaster-type.chart';
import { RequestsByDisasterTypeService } from './requests-by-disaster-type.service';

@Component({
  selector: 'app-requests-by-disaster-type',
  standalone: true,
  imports: [DashboardChartFilterComponent],
  templateUrl: './requests-by-disaster-type.component.html',
  styleUrl: './requests-by-disaster-type.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsByDisasterTypeComponent {
  private readonly store = inject(RequestsByDisasterTypeService);
  private readonly chartHost = viewChild.required<ElementRef<HTMLElement>>('chart');

  private chart: ApexCharts | null = null;
  private destroyed = false;

  protected readonly data = this.store.data;

  protected filterPeriod(period: DashboardChartPeriod): void {
    void this.store.refresh(period.month, period.year);
  }

  constructor() {
    afterNextRender(() => {
      void this.mountChart().catch((error) =>
        console.error('Requests by disaster type chart failed to render', error)
      );
    });

    effect(() => {
      const data = this.data();
      if (this.chart) {
        void this.chart.updateOptions(buildRequestsByDisasterTypeOptions(data));
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.chart?.destroy();
    });
  }

  private async mountChart(): Promise<void> {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const { default: ApexChartsCtor } = await import('apexcharts');
    if (this.destroyed) {
      return;
    }

    this.chart = new ApexChartsCtor(
      this.chartHost().nativeElement,
      buildRequestsByDisasterTypeOptions(this.data())
    );
    await this.chart.render();
    await this.store.refresh();
  }
}
