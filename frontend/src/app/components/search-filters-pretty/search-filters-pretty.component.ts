import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FiltersConfig, filtersConfig, optionsPreset } from './filters-config.model';

@Component({
  selector: 'app-search-filters-pretty',
  templateUrl: './search-filters-pretty.component.html',
  styleUrls: ['./search-filters-pretty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFiltersPrettyComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filters: any = {};
  @Input() filtersConfig = filtersConfig;
  tempoFormControl: FormControl;
  destroySub: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.filtersConfig.firstChange && changes.filtersConfig) {
      this.tempoFormControl.reset();
    }
  }

  ngOnInit(): void {
    this.tempoFormControl = new FormControl(null, [Validators.min(0)]);
    this.tempoFormControl.valueChanges.pipe(takeUntil(this.destroySub)).subscribe((tempo) => {
      if (tempo > 0) {
        Object.assign(this.filters, {
          min_tempo: +tempo - 3 > 0 ? +tempo - 3 : 0,
          target_tempo: +tempo,
          max_tempo: +tempo + 3,
        });
      } else {
        Object.assign(this.filters, {
          min_tempo: null,
          target_tempo: null,
          max_tempo: null,
        });
      }
    });
  }

  toggle(config: FiltersConfig, type: 'yes' | 'no'): void {
    if (config.toggle[type].pressed) {
      ['min', 'target', 'max'].forEach((prefix) => {
        this.filters[`${prefix}_${config.key}`] = null;
      });
    } else {
      ['min', 'target', 'max'].forEach((prefix) => {
        this.filters[`${prefix}_${config.key}`] = config.toggle[type].options
          ? config.toggle[type].options[`${prefix}_${config.key}`]
          : optionsPreset[type][prefix];
      });
    }
    config.toggle[type].pressed = !config.toggle[type].pressed;
    if (config.toggle[type === 'yes' ? 'no' : 'yes'].pressed) config.toggle[type === 'yes' ? 'no' : 'yes'].pressed = false;
  }

  ngOnDestroy() {
    this.destroySub.next(true);
  }
}
