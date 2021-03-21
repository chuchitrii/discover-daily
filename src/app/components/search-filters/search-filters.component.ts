import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent implements OnInit {
  form: FormGroup;
  inputs: { name: string; min?: number; max?: number; step?: number }[] = [
    {
      name: 'acousticness',
    },
    {
      name: 'danceability',
    },
    {
      name: 'energy',
    },
    {
      name: 'instrumentalness',
    },
    {
      name: 'liveness',
      // not sure
    },
    {
      name: 'popularity',
      min: 0,
      max: 100,
      step: 1,
    },
    {
      name: 'tempo',
      min: 0,
      max: 300,
      step: 1,
    },
    {
      name: 'valence',
    },
  ];

  constructor() {}

  ngOnInit() {}
}
