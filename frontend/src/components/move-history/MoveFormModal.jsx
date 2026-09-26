import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const MoveFormModal = ({ isOpen, onClose, onSubmit, products = [], locations = [] }) => {
  const [contact, setContact] = useState('');
  const [source, setSource] = useState('WH/Stock');
  const [destination, setDestination] = useState('HUB/Stock');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('Done');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16).replace('T', ' '));

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProd = products.find((p) => p.id === productId);
    const prodName = selectedProd ? selectedProd.name : 'Custom Item';

    onSubmit({
      reference: `WH/MOVE/${String(Math.floor(1000 + Math.random() * 9000))}`,
      date,
      contact: contact || 'Manual Inventory Transfer',
      source,
      destination,
      product: prodName,
      quantity: Number(quantity),
      status
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Movement"
      description="Manually record a stock transfer movement in the ledger"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact / Partner Name"
            placeholder="e.g. Warehouse Team / Supplier"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <Input
            label="Timestamp Date *"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Source Location *</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. WH/Stock"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Location *</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. HUB/Stock"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Product *</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity Delta *"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <Select
            label="Movement Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Done">Done (Completed)</option>
            <option value="Pending">Pending / In-Transit</option>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Record Movement
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
