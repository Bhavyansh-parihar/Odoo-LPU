import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../schemas';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const ProductForm = ({ initialValues, onSubmit, isLoading = false, submitLabel = 'Save Product' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues || {
      name: '',
      sku: '',
      category: 'Electronics & Components',
      uom: 'pcs',
      initialStock: 0,
      minStock: 10,
      reorderQty: 20,
      costPrice: 0,
      salePrice: 0,
      description: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-[#15px] space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name *"
          placeholder="e.g. Ergonomic Mech Keyboard"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="SKU / Code *"
          placeholder="e.g. ELEC-KB-WM90"
          error={errors.sku?.message}
          {...register('sku')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select label="Product Category *" error={errors.category?.message} {...register('category')}>
          <option value="Electronics & Components">Electronics & Components</option>
          <option value="Office Furniture & Supplies">Office Furniture & Supplies</option>
          <option value="Raw Materials & Hardware">Raw Materials & Hardware</option>
          <option value="Packaging & Shipping">Packaging & Shipping</option>
          <option value="Finished Goods">Finished Goods</option>
        </Select>

        <Select label="Unit of Measure (UoM) *" error={errors.uom?.message} {...register('uom')}>
          <option value="pcs">pcs (Pieces)</option>
          <option value="kg">kg (Kilograms)</option>
          <option value="m">m (Meters)</option>
          <option value="box">box (Boxes)</option>
          <option value="L">L (Liters)</option>
          <option value="set">set (Sets)</option>
        </Select>

        <Input
          label="Initial Stock Quantity *"
          type="number"
          placeholder="0"
          disabled={!!initialValues}
          error={errors.initialStock?.message}
          {...register('initialStock')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <Input
          label="Minimum Stock Level (Safety threshold)"
          type="number"
          placeholder="10"
          error={errors.minStock?.message}
          {...register('minStock')}
        />
        <Input
          label="Default Reorder Batch Quantity"
          type="number"
          placeholder="20"
          error={errors.reorderQty?.message}
          {...register('reorderQty')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Cost Price ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.costPrice?.message}
          {...register('costPrice')}
        />
        <Input
          label="Sale Price ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.salePrice?.message}
          {...register('salePrice')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Description / Notes</label>
        <textarea
          rows={3}
          placeholder="Enter product specification details..."
          className="w-full rounded-lg border border-slate-300 text-xs p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
