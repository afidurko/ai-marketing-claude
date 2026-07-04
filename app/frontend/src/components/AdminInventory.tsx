import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Upload, Plus, Pencil } from 'lucide-react';
import { api, type Card, formatPrice, resolveImageUrl } from '../api';

const EMPTY: Partial<Card> = {
  player_name: '',
  year: new Date().getFullYear(),
  set_name: '',
  grade: '8',
  grader: 'PSA',
  condition: 'Near Mint',
  price: 100,
  status: 'available',
  image_url: '',
  description: '',
  rarity: 'Common',
};

interface Props {
  token: string;
  onChanged: () => void;
}

export function AdminInventory({ token, onChanged }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [form, setForm] = useState<Partial<Card>>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCards(await api.getCards({}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { key, url } = await api.uploadImage(token, file);
      setForm((f) => ({ ...f, image_url: resolveImageUrl(url), image_key: key }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.updateCard(token, editingId, form);
      } else {
        await api.createCard(token, form);
      }
      setForm(EMPTY);
      setEditingId(null);
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (card: Card) => {
    setEditingId(card.id);
    setForm({ ...card });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this card from inventory?')) return;
    await api.deleteCard(token, id);
    await load();
    onChanged();
  };

  if (loading) return <div className="loading">Loading admin inventory…</div>;

  return (
    <div>
      <h2 style={{ color: 'var(--leather)', marginBottom: '1rem' }}>Manage Inventory</h2>

      <form className="panel admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Card' : 'Add New Card'}</h3>
        <div className="admin-form-grid">
          <div className="form-group">
            <label>Player Name</label>
            <input
              value={form.player_name || ''}
              onChange={(e) => setForm({ ...form, player_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={form.year || ''}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Set</label>
            <input
              value={form.set_name || ''}
              onChange={(e) => setForm({ ...form, set_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Grade</label>
            <input
              value={form.grade || ''}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
              min={1}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status || 'available'}
              onChange={(e) => setForm({ ...form, status: e.target.value as Card['status'] })}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div className="form-group">
            <label>Rarity</label>
            <select
              value={form.rarity || 'Common'}
              onChange={(e) => setForm({ ...form, rarity: e.target.value })}
            >
              {['Common', 'Uncommon', 'Rare', 'Legendary'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Slab Photo</label>
            <label className="upload-btn">
              <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload Image'}
              <input type="file" accept="image/*" hidden onChange={handleUpload} />
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Image URL (or upload above)</label>
          <input
            value={form.image_url || ''}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Card' : <><Plus size={14} /> Add Card</>}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setEditingId(null); setForm(EMPTY); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h3>All Cards ({cards.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Year / Set</th>
                <th>Grade</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <motion.tr key={card.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>{card.player_name}</td>
                  <td>{card.year} {card.set_name}</td>
                  <td>{card.grader} {card.grade}</td>
                  <td>{formatPrice(card.price)}</td>
                  <td><span className={`status-chip status-${card.status}`}>{card.status}</span></td>
                  <td className="admin-actions">
                    <button onClick={() => startEdit(card)} aria-label="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(card.id)} aria-label="Delete"><Trash2 size={14} /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
