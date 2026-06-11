'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCard, getMarketPrice } from '@/lib/api';
import { PokemonCard } from '@/lib/types';
import { getTypeColor } from '@/lib/typeColors';
import { useCollection } from '@/lib/context/CollectionContext';
import TiltCard from '@/components/TiltCard/TiltCard';
import BackgroundEffects from '@/components/BackgroundEffects/BackgroundEffects';
import Button from '@/components/Button/Button';
import styles from './card.module.scss';

function formatPrice(val: number | undefined, currency = '$') {
  if (val === undefined || val === null) return 'N/A';
  return currency === '€'
    ? `${val.toFixed(2).replace('.', ',')} €`
    : `$${val.toFixed(2)}`;
}

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace('Reverse Holo', 'Rev. Holo');
}

export default function CardDetailClient() {
  const params = useParams<{ id: string }>();
  const [card, setCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'abilities' | 'attacks'>('attacks');
  const [priceSource, setPriceSource] = useState<'tcgplayer' | 'cardmarket'>('tcgplayer');
  const { addCard, removeCard, isInCollection, getQuantity } = useCollection();

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    getCard(params.id)
      .then(setCard)
      .catch(() => setError('Failed to load card.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <BackgroundEffects />
        <div className={styles.loadingLayout}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonInfo}>
            {[60, 40, 80, 50, 90].map((w, i) => (
              <div key={i} className={styles.skeletonLine} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className={styles.page}>
        <BackgroundEffects />
        <div className={styles.errorState}>
          <h2>Card not found</h2>
          <p>{error || 'This card could not be loaded.'}</p>
          <Link href="/search"><Button variant="primary">Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  const typeColor = getTypeColor(card.types);
  const price = getMarketPrice(card);
  const inCollection = isInCollection(card.id);
  const qty = getQuantity(card.id);
  const hasAbilities = card.abilities && card.abilities.length > 0;
  const hasAttacks = card.attacks && card.attacks.length > 0;
  const hasRules = card.rules && card.rules.length > 0;

  return (
    <div className={styles.page}>
      <BackgroundEffects glowColor={typeColor.glow} />

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href="/search" className={styles.breadcrumbLink}>Search</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{card.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* ───── Left: Card Preview ───── */}
        <div className={styles.cardSection}>
          <TiltCard src={card.images.small} alt={card.name} glowColor={typeColor.glow} />

          <div className={styles.cardActions}>
            {inCollection ? (
              <>
                <div className={styles.collectionPill} style={{ borderColor: typeColor.accent, color: typeColor.accent }}>
                  In Collection · ×{qty}
                </div>
                <Button variant="primary" size="small" onClick={() => addCard(card)}>+ Add</Button>
                <Button variant="danger" size="small" onClick={() => removeCard(card.id)}>Remove</Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => addCard(card)}>+ Add to Collection</Button>
            )}
          </div>
        </div>

        {/* ───── Right: Details Panel ───── */}
        <div className={styles.detailsSection}>
          {/* Header */}
          <h1 className={styles.name}>{card.name}</h1>
          <p className={styles.subtitle}>
            {card.supertype}
            {card.subtypes && card.subtypes.length > 0 && ` — ${card.subtypes.join(', ')}`}
          </p>

          <div className={styles.pillRow}>
            {card.hp && (
              <span className={styles.pillHp} style={{ borderColor: typeColor.accent, color: typeColor.accent }}>
                HP {card.hp}
              </span>
            )}
            {card.types?.map((t) => (
              <span key={t} className={styles.pill}>{t}</span>
            ))}
            {card.rarity && (
              <span className={styles.pillGlow} style={{ borderColor: typeColor.accent, color: typeColor.accent, boxShadow: `0 0 12px ${typeColor.glow}` }}>
                {card.rarity}
              </span>
            )}
            {card.evolvesFrom && (
              <span className={styles.pill}>Evolves from {card.evolvesFrom}</span>
            )}
          </div>

          {/* ── Prices Section ── */}
          {(card.tcgplayer || card.cardmarket) && (
            <div className={styles.priceSection}>
              <h2 className={styles.sectionTitle}>Prices</h2>

              {/* Source Tabs */}
              <div className={styles.priceTabBar}>
                {card.tcgplayer && (
                  <button
                    className={`${styles.priceTab} ${priceSource === 'tcgplayer' ? styles.priceTabActive : ''}`}
                    onClick={() => setPriceSource('tcgplayer')}
                  >
                    TCGPlayer
                  </button>
                )}
                {card.cardmarket && (
                  <button
                    className={`${styles.priceTab} ${priceSource === 'cardmarket' ? styles.priceTabActive : ''}`}
                    onClick={() => setPriceSource('cardmarket')}
                  >
                    Cardmarket
                  </button>
                )}
              </div>

              <div className={styles.priceContent}>
                {priceSource === 'tcgplayer' && card.tcgplayer && (
                  <>
                    <a href={card.tcgplayer.url} target="_blank" rel="noopener noreferrer" className={styles.priceBuyLink}>
                      Buy Now From TCGplayer →
                    </a>
                    <p className={styles.priceUpdated}>Last Updated {card.tcgplayer.updatedAt}</p>
                    {card.tcgplayer.prices && Object.entries(card.tcgplayer.prices).map(([variant, prices]) => (
                      <div key={variant} className={styles.priceVariant}>
                        <div className={styles.priceGrid}>
                          {prices.market !== undefined && (
                            <div className={styles.priceItem}>
                              <span className={styles.priceItemLabel}>{variant} market</span>
                              <span className={styles.priceItemValue} style={{ color: typeColor.accent }}>
                                {formatPrice(prices.market)}
                              </span>
                            </div>
                          )}
                          {prices.low !== undefined && (
                            <div className={styles.priceItem}>
                              <span className={styles.priceItemLabel}>{variant} low</span>
                              <span className={styles.priceItemValue}>{formatPrice(prices.low)}</span>
                            </div>
                          )}
                          {prices.mid !== undefined && (
                            <div className={styles.priceItem}>
                              <span className={styles.priceItemLabel}>{variant} mid</span>
                              <span className={styles.priceItemValue}>{formatPrice(prices.mid)}</span>
                            </div>
                          )}
                          {prices.high !== undefined && (
                            <div className={styles.priceItem}>
                              <span className={styles.priceItemLabel}>{variant} high</span>
                              <span className={styles.priceItemValue}>{formatPrice(prices.high)}</span>
                            </div>
                          )}
                          {prices.directLow !== undefined && (
                            <div className={styles.priceItem}>
                              <span className={styles.priceItemLabel}>{variant} direct low</span>
                              <span className={styles.priceItemValue}>{formatPrice(prices.directLow)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {priceSource === 'cardmarket' && card.cardmarket && (
                  <>
                    <a href={card.cardmarket.url} target="_blank" rel="noopener noreferrer" className={styles.priceBuyLink}>
                      Buy Now From Cardmarket →
                    </a>
                    <p className={styles.priceUpdated}>Last Updated {card.cardmarket.updatedAt}</p>
                    {card.cardmarket.prices && (
                      <div className={styles.priceGrid}>
                        {card.cardmarket.prices.trendPrice !== undefined && card.cardmarket.prices.trendPrice > 0 && (
                          <div className={styles.priceItem}>
                            <span className={styles.priceItemLabel}>price trend</span>
                            <span className={styles.priceItemValue} style={{ color: typeColor.accent }}>
                              {formatPrice(card.cardmarket.prices.trendPrice, '€')}
                            </span>
                          </div>
                        )}
                        {card.cardmarket.prices.avg1 !== undefined && card.cardmarket.prices.avg1 > 0 && (
                          <div className={styles.priceItem}>
                            <span className={styles.priceItemLabel}>1 day average</span>
                            <span className={styles.priceItemValue}>{formatPrice(card.cardmarket.prices.avg1, '€')}</span>
                          </div>
                        )}
                        {card.cardmarket.prices.avg7 !== undefined && card.cardmarket.prices.avg7 > 0 && (
                          <div className={styles.priceItem}>
                            <span className={styles.priceItemLabel}>7 day average</span>
                            <span className={styles.priceItemValue}>{formatPrice(card.cardmarket.prices.avg7, '€')}</span>
                          </div>
                        )}
                        {card.cardmarket.prices.avg30 !== undefined && card.cardmarket.prices.avg30 > 0 && (
                          <div className={styles.priceItem}>
                            <span className={styles.priceItemLabel}>30 day average</span>
                            <span className={styles.priceItemValue}>{formatPrice(card.cardmarket.prices.avg30, '€')}</span>
                          </div>
                        )}
                        {card.cardmarket.prices.lowPrice !== undefined && card.cardmarket.prices.lowPrice > 0 && (
                          <div className={styles.priceItem}>
                            <span className={styles.priceItemLabel}>low price</span>
                            <span className={styles.priceItemValue}>{formatPrice(card.cardmarket.prices.lowPrice, '€')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Abilities ── */}
          {hasAbilities && (
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Abilities</h2>
              {card.abilities!.map((a) => (
                <div key={a.name} className={styles.abilityRow}>
                  <div className={styles.abilityHeader}>
                    <span className={styles.abilityType} style={{ color: typeColor.accent }}>{a.type}</span>
                    <strong className={styles.abilityName}>{a.name}</strong>
                  </div>
                  <p className={styles.abilityText}>{a.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Attacks ── */}
          {hasAttacks && (
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Attacks</h2>
              {card.attacks!.map((a) => (
                <div key={a.name} className={styles.attackRow}>
                  <div className={styles.attackHead}>
                    <div className={styles.attackLeft}>
                      <span className={styles.attackCost}>{a.cost.join(' · ')}</span>
                      <span className={styles.attackName}>{a.name}</span>
                    </div>
                    {a.damage && (
                      <span className={styles.attackDmg} style={{ color: typeColor.accent }}>
                        {a.damage}
                      </span>
                    )}
                  </div>
                  {a.text && <p className={styles.attackDesc}>{a.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ── Combat Stats (weakness / resistance / retreat) ── */}
          <div className={styles.combatGrid}>
            <div className={styles.combatItem}>
              <span className={styles.combatLabel}>weakness</span>
              <span className={styles.combatValue}>
                {card.weaknesses && card.weaknesses.length > 0
                  ? card.weaknesses.map((w) => `${w.type} ${w.value}`).join(', ')
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.combatItem}>
              <span className={styles.combatLabel}>resistance</span>
              <span className={styles.combatValue}>
                {card.resistances && card.resistances.length > 0
                  ? card.resistances.map((r) => `${r.type} ${r.value}`).join(', ')
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.combatItem}>
              <span className={styles.combatLabel}>retreat cost</span>
              <span className={styles.combatValue}>
                {card.retreatCost ? card.retreatCost.join(' · ') : 'N/A'}
              </span>
            </div>
          </div>

          {/* ── Card Meta ── */}
          <div className={styles.metaGrid}>
            {card.artist && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>artist</span>
                <span className={styles.metaValue}>{card.artist}</span>
              </div>
            )}
            {card.rarity && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>rarity</span>
                <span className={styles.metaValue}>{card.rarity}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>set</span>
              <Link href={`/sets/${card.set.id}`} className={styles.metaLink}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.set.images.symbol} alt={card.set.name} className={styles.setSymbol} />
                {card.set.name}
              </Link>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>number</span>
              <span className={styles.metaValue}>{card.number} / {card.set.printedTotal}</span>
            </div>
            {card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>pokédex</span>
                <span className={styles.metaValue}>#{card.nationalPokedexNumbers.join(', #')}</span>
              </div>
            )}
          </div>

          {/* ── Flavor Text ── */}
          {card.flavorText && (
            <p className={styles.flavor}>&ldquo;{card.flavorText}&rdquo;</p>
          )}

          {/* ── Rules ── */}
          {hasRules && (
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Rules</h2>
              {card.rules!.map((rule, i) => (
                <p key={i} className={styles.ruleText}>{rule}</p>
              ))}
            </div>
          )}

          {/* ── Legalities ── */}
          {card.legalities && (
            <div className={styles.legalitiesRow}>
              {(['standard', 'expanded', 'unlimited'] as const).map((format) => {
                const status = card.legalities?.[format];
                const isLegal = status === 'Legal';
                return (
                  <div
                    key={format}
                    className={`${styles.legalityPill} ${isLegal ? styles.legalityLegal : styles.legalityNotLegal}`}
                  >
                    <span className={styles.legalityFormat}>{format}</span>
                    <span className={styles.legalityStatus}>{status || 'Not Legal'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
