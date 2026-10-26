import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import type { Chart } from 'chart.js';

import { DashboardChartFilterComponent, DashboardChartPeriod } from '../dashboard-chart-filter.component';
import {
  DONATION_SERIES_COLORS,
  buildDonationOffersOverviewData,
  buildDonationOffersOverviewOptions
} from './donation-offers-overview.chart';
import { DONATION_SERIES_NAMES } from './donation-offers-overview.data';
import { DonationOffersOverviewService } from './donation-offers-overview.service';

interface DonationLegendItem {
  seriesName: string;
  label: string;
  color: string;
}

type DonationOfferStatus = 'Pending Coordination' | 'Coordinating' | 'For Verification' | 'Verified' | 'Distributed' | 'Completed';

interface DonationOffer {
  id: string;
  donor: string;
  item: string;
  quantity: string;
  date: string;
  status: DonationOfferStatus;
  requestId: string;
}

@Component({
  selector: 'app-donation-offers-overview',
  standalone: true,
  imports: [DashboardChartFilterComponent],
  templateUrl: './donation-offers-overview.component.html',
  styleUrl: './donation-offers-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationOffersOverviewComponent {
  private readonly router = inject(Router);
  private readonly store = inject(DonationOffersOverviewService);
  private readonly chartHost = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');

  private chart: Chart<'line', number[], string> | null = null;
  private destroyed = false;

  protected readonly data = this.store.data;

  protected filterPeriod(period: DashboardChartPeriod): void {
    void this.store.refresh(period.month, period.year);
  }

  protected readonly legendItems: DonationLegendItem[] = [
    {
      seriesName: DONATION_SERIES_NAMES.total,
      label: DONATION_SERIES_NAMES.total,
      color: DONATION_SERIES_COLORS.total
    },
    {
      seriesName: DONATION_SERIES_NAMES.awaitingReview,
      label: DONATION_SERIES_NAMES.awaitingReview,
      color: DONATION_SERIES_COLORS.awaitingReview
    },
    {
      seriesName: DONATION_SERIES_NAMES.coordinatedWithDswd,
      label: DONATION_SERIES_NAMES.coordinatedWithDswd,
      color: DONATION_SERIES_COLORS.coordinatedWithDswd
    },
    {
      seriesName: DONATION_SERIES_NAMES.updatesRecorded,
      label: DONATION_SERIES_NAMES.updatesRecorded,
      color: DONATION_SERIES_COLORS.updatesRecorded
    }
  ];

  private readonly hidden = signal<ReadonlySet<string>>(new Set<string>());

  constructor() {
    afterNextRender(() => {
      void this.mountChart().catch((error) =>
        console.error('Donation offers overview chart failed to render', error)
      );
    });

    effect(() => {
      const data = this.data();
      if (!this.chart) {
        return;
      }

      this.chart.data = buildDonationOffersOverviewData(data);
      this.chart.update();
      untracked(() => this.applyHiddenSeries());
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.chart?.destroy();
      this.chart = null;
    });
  }

  protected isSeriesHidden(seriesName: string): boolean {
    return this.hidden().has(seriesName);
  }

  protected toggleSeries(seriesName: string): void {
    const next = new Set(this.hidden());
    const willShow = next.has(seriesName);

    if (willShow) {
      next.delete(seriesName);
    } else {
      next.add(seriesName);
    }

    this.hidden.set(next);

    if (!this.chart) {
      return;
    }

    const index = this.chart.data.datasets.findIndex((dataset) => dataset.label === seriesName);
    if (index < 0) {
      return;
    }

    this.chart.setDatasetVisibility(index, willShow);
    this.chart.update();
  }

  protected statusClass(status: DonationOfferStatus): string {
    return 'offer-status-' + status.toLowerCase().replace(/\s+/g, '-');
  }

  protected goToOffers(): void {
    this.router.navigate(['/donation-offers']);
  }

  protected openOffer(offer: DonationOffer): void {
    this.router.navigate([
      '/external-coordination',
      offer.requestId.replace(/^#/, ''),
      offer.id.replace(/^#/, '')
    ]);
  }

  private applyHiddenSeries(): void {
    const chart = this.chart;
    if (!chart) {
      return;
    }

    let changed = false;
    chart.data.datasets.forEach((dataset, index) => {
      if (dataset.label && this.hidden().has(dataset.label) && chart.isDatasetVisible(index)) {
        chart.setDatasetVisibility(index, false);
        changed = true;
      }
    });

    if (changed) {
      chart.update();
    }
  }

  private async mountChart(): Promise<void> {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const {
      Chart: ChartConstructor,
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Tooltip,
      Filler
    } = await import('chart.js');

    ChartConstructor.register(
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Tooltip,
      Filler
    );

    if (this.destroyed) {
      return;
    }

    this.chart = new ChartConstructor(this.chartHost().nativeElement, {
      type: 'line',
      data: buildDonationOffersOverviewData(this.data()),
      options: buildDonationOffersOverviewOptions()
    });

    this.applyHiddenSeries();
    await this.store.refresh();
  }
}
