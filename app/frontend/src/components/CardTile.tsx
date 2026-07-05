import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import type { Card } from '../api';
import { formatPrice } from '../api';
import { SlabFrame } from './SlabFrame';

interface Props {
  card: Card;
  onView: (card: Card) => void;
  onBuy: (card: Card) => void;
}

export function CardTile({ card, onView, onBuy }: Props) {
  return (
    <motion.article
      className={`card-tile ${card.status !== 'available' ? 'sold' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="card-image-wrap">
        <SlabFrame
          src={card.image_url}
          alt={`${card.year} ${card.player_name}`}
          grader={card.grader}
          grade={card.grade}
          size="md"
          rarity={card.rarity}
        />
        <span className={`rarity-badge rarity-${card.rarity}`}>{card.rarity}</span>
        <span className="status-badge">{card.status}</span>
      </div>
      <div className="card-body">
        <h3>{card.player_name}</h3>
        <p className="card-meta">
          {card.year} {card.set_name}
        </p>
        <span className="grade-tag">
          {card.grader} {card.grade}
        </span>
        <span className="grade-tag">{card.condition}</span>
        <p className="card-price">{formatPrice(card.price)}</p>
        <div className="card-actions">
          <button className="btn-secondary" onClick={() => onView(card)} aria-label="View details">
            <Eye size={16} />
          </button>
          <button
            className="btn-primary"
            onClick={() => onBuy(card)}
            disabled={card.status !== 'available'}
          >
            <ShoppingBag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Acquire
          </button>
        </div>
      </div>
    </motion.article>
  );
}
