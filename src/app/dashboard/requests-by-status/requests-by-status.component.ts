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
import { buildRequestsByStatusOptions } from './requests-by-status.chart';
import { RequestsByStatusService } from './requests-by-status.service';

@Component({
  selector: 'app-requests-by-status',
  standalone: true,
  imports: [DashboardChartFilterComponent],
  templateUrl: './requests-by-status.component.html',
  styleUrl: './requests-by-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsByStatusComponent {
  private readonly store = inject(RequestsByStatusService);
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
        console.error('Requests by status chart failed to render', error)
      );
    });

    effect(() => {
      const data = this.data();
      if (this.chart) {
        void this.chart.updateOptions(buildRequestsByStatusOptions(data));
        this.chart.clearDrilldownCache();
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
    await import('apexcharts/features/drilldown');

    if (this.destroyed) {
      return;
    }

    this.chart = new ApexChartsCtor(
      this.chartHost().nativeElement,
      buildRequestsByStatusOptions(this.data())
    );
    await this.chart.render();
    await this.store.refresh();
  }
}
