import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reorderRuleSchema } from '../../schemas';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const ReorderRulesModal = ({ isOpen, onClose, product, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(reorderRuleSchema),
    defaultValues: {
      minQty: product?.reorderRules?.minQty ?? product?.minStock ?? 10,
      maxQty: product?.reorderRules?.maxQty ?? 50,
      autoTrigger: product?.reorderRules?.autoTrigger ?? true
    }
  });

  const onSubmit = (data) => {
    onSave(product.id, data);
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Reordering Rules: ${product.name}`}
      description={`Configure automatic replenishment triggers for SKU: ${product.sku}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Minimum Quantity (Trigger point)"
            type="number"
            error={errors.minQty?.message}
            {...register('minQty')}
          />
          <Input
            label="Maximum Stock Target"
            type="number"
            error={errors.maxQty?.message}
            {...register('maxQty')}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="autoTrigger"
            className="rounded-sm text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            {...register('autoTrigger')}
          />
          <label htmlFor="autoTrigger" className="text-xs text-slate-700 font-medium cursor-pointer">
            Automatically create Draft Receipt when stock falls below Min Qty
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Reorder Rule
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
