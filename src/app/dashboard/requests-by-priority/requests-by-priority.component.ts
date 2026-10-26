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

import { buildRequestsByPriorityOptions } from './requests-by-priority.chart';
import { RequestsByPriorityService } from './requests-by-priority.service';

@Component({
  selector: 'app-requests-by-priority',
  standalone: true,
  templateUrl: './requests-by-priority.component.html',
  styleUrl: './requests-by-priority.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsByPriorityComponent {
  private readonly store = inject(RequestsByPriorityService);
  private readonly chartHost = viewChild.required<ElementRef<HTMLElement>>('chart');

  private chart: ApexCharts | null = null;
  private destroyed = false;

  protected readonly data = this.store.data;

  constructor() {
    afterNextRender(() => {
      void this.mountChart().catch((error) =>
        console.error('Requests by priority chart failed to render', error)
      );
    });

    effect(() => {
      const data = this.data();
      if (this.chart) {
        void this.chart.updateOptions(buildRequestsByPriorityOptions(data));
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
      buildRequestsByPriorityOptions(this.data())
    );
    await this.chart.render();
    await this.store.refresh();
  }
}
