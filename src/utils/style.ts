// Generic Utility (see component-development-system.md §11.1 for the
// Foundation-vs-Utility distinction) — a standalone className helper with no
// consumer-evidence/Stop-Condition lineage of its own, unlike this
// directory's other files (useFieldIds.ts, focusRing.ts). Sun's one
// deliberate public non-visual export ("./cn").
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
