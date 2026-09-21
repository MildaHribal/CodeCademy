import { describe, expect, test } from 'vitest';

import { formatujCastku } from './rozpocet.ts';

describe('formatujCastku', () => {
  test('tisíce odděluje pevnou mezerou', () => {
    expect(formatujCastku(1290)).toBe('1 290 Kč');
  });

  // TODO: dopiš testy na zbytek rozpočtu. Začni tím, který právě svítí červeně.
});
