import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export const ReceiptFormModal = ({ isOpen, onClose, onSubmit, products = [], locations = [] }) => {
  const [supplier, setSupplier] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('WH/Input');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', qtyExpected: 10 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', qtyExpected: 10 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier) return alert('Please enter a supplier name');
    onSubmit({
      supplier,
      destinationLocation,
      date,
      notes,
      items
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Incoming Goods Receipt"
      description="Record a new shipment receiving document from a supplier"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Supplier / Contact *"
            placeholder="e.g. TechSupply Global Co."
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
          />
          <Select
            label="Destination Location *"
            value={destinationLocation}
            onChange={(e) => setDestinationLocation(e.target.value)}
          >
            <option value="WH/Input">WH/Input (Receiving Bay)</option>
            <option value="WH/Stock">WH/Stock (Main Storage)</option>
            <option value="HUB/Stock">HUB/Stock (Regional Hub)</option>
          </Select>
        </div>

        <Input
          label="Receipt Date *"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Dynamic Items Selection Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">Received Line Items *</label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} icon={Plus}>
              Add Product Line
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    min="1"
                    value={item.qtyExpected}
                    onChange={(e) => handleItemChange(idx, 'qtyExpected', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-xs"
                    placeholder="Qty"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-40"
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Notes / PO Reference</label>
          <input
            type="text"
            placeholder="e.g. Purchase Order #PO-88219"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Receipt
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
