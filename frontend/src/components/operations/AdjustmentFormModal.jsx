import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const AdjustmentFormModal = ({ isOpen, onClose, onSubmit, products = [], locations = [] }) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [location, setLocation] = useState('WH/Stock');
  const [recordedQty, setRecordedQty] = useState(0);
  const [countedQty, setCountedQty] = useState(0);
  const [reason, setReason] = useState('');

  // Sync recordedQty when product or location changes
  useEffect(() => {
    const prod = products.find(p => p.id === selectedProductId);
    if (prod) {
      const locMatch = prod.stockByLocation.find(l => l.locationCode === location);
      const qty = locMatch ? locMatch.qty : prod.totalStock;
      setRecordedQty(qty);
      setCountedQty(qty);
    }
  }, [selectedProductId, location, products]);

  const adjustmentQty = Number(countedQty) - Number(recordedQty);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert('Please select a product');
    if (!reason) return alert('Please provide a reason for inventory adjustment');

    onSubmit({
      productId: selectedProductId,
      location,
      recordedQty,
      countedQty: Number(countedQty),
      adjustmentQty,
      reason
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Inventory Adjustment"
      description="Reconcile recorded stock levels with actual physical count"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Location *"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="WH/Stock">WH/Stock (Main Storage)</option>
          <option value="HUB/Stock">HUB/Stock (Regional Hub)</option>
          <option value="NORTH/Store">NORTH/Store (Retail Depot)</option>
        </Select>

        <Select
          label="Select Product to Adjust *"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} - {p.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase">System Recorded</label>
            <p className="text-base font-bold text-slate-900 mt-1">{recordedQty}</p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase">Physical Count *</label>
            <input
              type="number"
              min="0"
              value={countedQty}
              onChange={(e) => setCountedQty(e.target.value)}
              className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded-md text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase">Adjustment Diff</label>
            <p className={`text-base font-bold mt-1 ${adjustmentQty >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {adjustmentQty >= 0 ? `+${adjustmentQty}` : adjustmentQty}
            </p>
          </div>
        </div>

        <Input
          label="Reason / Audit Reference *"
          placeholder="e.g. Annual stock count mismatch / Damaged goods during transit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Record Adjustment
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
