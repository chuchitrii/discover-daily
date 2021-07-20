import { RecommendationsOptionsObject } from '../../models/spotify-api';

export const filtersConfig: FiltersConfig[] = [
  {
    label: 'acoustic',
    key: 'acousticness',
    toggle: {
      yes: {
        label: 'yes',
      },
      no: {
        label: 'no',
      },
    },
  },
  {
    label: 'danceable',
    key: 'danceability',
    toggle: {
      yes: {
        label: 'yes',
      },
      no: {
        label: 'no',
      },
    },
  },
  {
    label: 'instrumental',
    key: 'instrumentalness',
    toggle: {
      yes: {
        label: 'yes',
      },
      no: {
        label: 'no',
      },
    },
  },
  {
    label: 'live',
    key: 'liveness',
    toggle: {
      yes: {
        label: 'yes',
      },
      no: {
        label: 'no',
      },
    },
  },
  {
    label: 'popular',
    key: 'popularity',
    toggle: {
      yes: {
        label: 'yes',
        options: {
          min_popularity: 70,
          target_popularity: 100,
          max_popularity: 100,
        },
      },
      no: {
        label: 'no',
        options: {
          min_popularity: 0,
          target_popularity: 0,
          max_popularity: 40,
        },
      },
    },
  },
  {
    label: 'energy',
    key: 'energy',
    toggle: {
      yes: {
        label: 'high',
      },
      no: {
        label: 'low',
      },
    },
  },
  {
    label: 'mood',
    key: 'valence',
    toggle: {
      yes: {
        label: 'fun',
      },
      no: {
        label: 'sad',
      },
    },
  },
  {
    label: 'tempo',
    key: 'tempo',
    input: true,
  },
];

export const optionsPreset = {
  yes: {
    min: 0.7,
    target: 1,
    max: 1,
  },
  no: {
    min: 0,
    target: 0,
    max: 0.4,
  },
};

export interface FiltersConfig {
  label: string;
  key: string;
  toggle?: {
    yes: {
      label: string;
      pressed?: boolean;
      options?: Partial<RecommendationsOptionsObject>;
    };
    no: {
      label: string;
      pressed?: boolean;
      options?: Partial<RecommendationsOptionsObject>;
    };
  };
  input?: boolean;
}
