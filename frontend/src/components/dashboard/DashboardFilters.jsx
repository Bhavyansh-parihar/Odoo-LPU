import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { FilterDropdown } from '../common/FilterDropdown';
import { Button } from '../ui/Button';

export const DashboardFilters = ({
  docTypeFilter,
  setDocTypeFilter,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  categoryFilter,
  setCategoryFilter,
  locations = [],
  categories = [],
  onReset
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-700">
        <Filter className="w-4 h-4 text-indigo-600" />
        <span>Inventory Dashboard Quick Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Document Type Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Document Type</label>
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Documents</option>
            <option value="Receipt">Receipts (Incoming)</option>
            <option value="Delivery">Deliveries (Outgoing)</option>
            <option value="Transfer">Internal Transfers</option>
            <option value="Adjustment">Inventory Adjustments</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Document Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Ready">Ready</option>
            <option value="Arrived">Arrived</option>
            <option value="Waiting">Waiting</option>
            <option value="Picked">Picked</option>
            <option value="Packed">Packed</option>
            <option value="Delivered">Delivered</option>
            <option value="Done">Done / Applied</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Warehouse Location</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.code}>
                {loc.code} ({loc.name})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Product Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(docTypeFilter !== 'ALL' || statusFilter !== 'ALL' || locationFilter !== 'ALL' || categoryFilter !== 'ALL') && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset} icon={RotateCcw}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};
