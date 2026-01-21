/**
 * Convert Tailwind color classes to hex colors
 */
export const tailwindToHex: Record<string, string> = {
  // Orange
  'text-orange-400': '#fb923c',
  'text-orange-500': '#f97316',
  'text-orange-600': '#ea580c',

  // Amber
  'text-amber-600': '#d97706',

  // Green
  'text-green-500': '#22c55e',
  'text-green-600': '#16a34a',

  // Emerald
  'text-emerald-500': '#10b981',

  // Blue
  'text-blue-400': '#60a5fa',
  'text-blue-500': '#3b82f6',
  'text-blue-600': '#2563eb',

  // Yellow
  'text-yellow-400': '#facc15',
  'text-yellow-500': '#eab308',

  // Pink
  'text-pink-400': '#f472b6',
  'text-pink-500': '#ec4899',

  // Purple
  'text-purple-500': '#a855f7',
  'text-purple-600': '#9333ea',

  // Red
  'text-red-400': '#f87171',
  'text-red-500': '#ef4444',
  'text-red-600': '#dc2626',

  // Cyan
  'text-cyan-500': '#06b6d4',
  'text-cyan-600': '#0891b2',

  // Teal
  'text-teal-500': '#14b8a6',
  'text-teal-600': '#0d9488',

  // Indigo
  'text-indigo-500': '#6366f1',
  'text-indigo-600': '#4f46e5',

  // Slate
  'text-slate-500': '#64748b',
  'text-slate-600': '#475569',
  'text-slate-700': '#334155',

  // Gray
  'text-gray-500': '#6b7280',
  'text-gray-600': '#4b5563',

  // Rose
  'text-rose-400': '#fb7185',

  // Sky
  'text-sky-500': '#0ea5e9',

  // Default
  default: '#6b7280',
};

export function getTailwindColor(tailwindClass: string): string {
  return tailwindToHex[tailwindClass] || tailwindToHex['default'];
}
