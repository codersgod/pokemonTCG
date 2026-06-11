/** Map Pokémon energy types to theme colors (glow, gradient, accent) */
export const TYPE_COLORS: Record<string, { glow: string; gradient: string; accent: string }> = {
  Fire:      { glow: 'rgba(251, 146, 60, 0.5)',  gradient: 'linear-gradient(135deg, #f97316, #ef4444)', accent: '#fb923c' },
  Water:     { glow: 'rgba(59, 130, 246, 0.5)',   gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', accent: '#60a5fa' },
  Grass:     { glow: 'rgba(34, 197, 94, 0.5)',    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', accent: '#4ade80' },
  Lightning: { glow: 'rgba(250, 204, 21, 0.5)',   gradient: 'linear-gradient(135deg, #eab308, #f59e0b)', accent: '#facc15' },
  Psychic:   { glow: 'rgba(168, 85, 247, 0.5)',   gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', accent: '#c084fc' },
  Fighting:  { glow: 'rgba(194, 65, 12, 0.5)',    gradient: 'linear-gradient(135deg, #c2410c, #ea580c)', accent: '#fb923c' },
  Darkness:  { glow: 'rgba(100, 116, 139, 0.5)',  gradient: 'linear-gradient(135deg, #334155, #1e293b)', accent: '#94a3b8' },
  Metal:     { glow: 'rgba(148, 163, 184, 0.5)',  gradient: 'linear-gradient(135deg, #94a3b8, #64748b)', accent: '#cbd5e1' },
  Dragon:    { glow: 'rgba(234, 179, 8, 0.5)',    gradient: 'linear-gradient(135deg, #eab308, #a855f7)', accent: '#fbbf24' },
  Fairy:     { glow: 'rgba(244, 114, 182, 0.5)',  gradient: 'linear-gradient(135deg, #f472b6, #ec4899)', accent: '#f9a8d4' },
  Colorless: { glow: 'rgba(148, 163, 184, 0.4)',  gradient: 'linear-gradient(135deg, #64748b, #475569)', accent: '#94a3b8' },
};

export function getTypeColor(types?: string[]) {
  const type = types?.[0] || 'Colorless';
  return TYPE_COLORS[type] || TYPE_COLORS.Colorless;
}
