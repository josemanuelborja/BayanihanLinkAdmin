import { Component, EventEmitter, Output } from '@angular/core';

export interface DashboardChartPeriod {
  month: number | null;
  year: number | null;
}

@Component({
  selector: 'app-dashboard-chart-filter',
  standalone: true,
  template: `
    <div class="filters" role="group" aria-label="Filter chart by month and year">
      <label>Month
        <select (change)="month = $any($event.target).value; emit()">
          <option value="">All</option>
          <option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>
          <option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>
          <option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>
          <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
        </select>
      </label>
      <label>Year
        <select (change)="year = $any($event.target).value; emit()">
          <option value="">All</option>
          @for (item of years; track item) { <option [value]="item">{{ item }}</option> }
        </select>
      </label>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .filters { display:flex; align-items:center; gap:8px; }
    label { display:flex; align-items:center; gap:4px; color:#7d8ea9; font-size:11px; white-space:nowrap; }
    select { height:30px; max-width:94px; border:1px solid #dbe3ed; border-radius:7px; padding:0 6px; color:#33456a; background:white; font:inherit; }
  `]
})
export class DashboardChartFilterComponent {
  @Output() readonly periodChange = new EventEmitter<DashboardChartPeriod>();
  readonly years = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);
  month = '';
  year = '';

  emit(): void {
    this.periodChange.emit({ month: this.month ? Number(this.month) : null, year: this.year ? Number(this.year) : null });
  }
}
