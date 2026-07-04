import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../api';
import { formatPrice } from '../api';
import { SlabViewer } from './SlabFrame';

interface Props {
  card: Card | null;
  onClose: () => void;
  onBuy: (card: Card) => void;
}

export function CardModal({ card, onClose, onBuy }: Props) {
  if (!card) return null;

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="modal modal--slab"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>{card.player_name}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="modal-body">
            <SlabViewer
              src={card.image_url}
              alt={card.player_name}
              grader={card.grader}
              grade={card.grade}
              playerName={card.player_name}
              year={card.year}
              setName={card.set_name}
            />
            <p>{card.description}</p>
            <p className="card-price">{formatPrice(card.price)}</p>
            <button className="btn-primary" style={{ width: '100%' }} disabled={card.status !== 'available'} onClick={() => onBuy(card)}>
              {card.status === 'available' ? 'Add to Collection' : `Status: ${card.status}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface PurchaseProps {
  card: Card | null;
  stripeEnabled: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string) => Promise<{ demo?: boolean; message?: string }>;
}

export function PurchaseModal({ card, stripeEnabled, onClose, onSubmit }: PurchaseProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!card) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await onSubmit(email, name);
      if (result.demo) {
        setSuccess(result.message || 'Order completed!');
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="modal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Acquire Card</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <p>{card.player_name} — {formatPrice(card.price)}</p>
          {!stripeEnabled && (
            <p className="demo-notice">Demo mode: Stripe not configured. Order completes instantly.</p>
          )}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Processing…' : stripeEnabled ? 'Proceed to Stripe Checkout' : 'Complete Purchase'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
