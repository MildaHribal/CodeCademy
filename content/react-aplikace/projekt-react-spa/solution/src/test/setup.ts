import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Bez úklidu by v dokumentu zůstal i DOM předchozího testu a dotazy by našly dva prvky.
afterEach(cleanup);
