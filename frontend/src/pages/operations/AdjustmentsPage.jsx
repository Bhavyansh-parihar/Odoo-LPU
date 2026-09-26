import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { AdjustmentFormModal } from '../../components/operations/AdjustmentFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { Plus, CheckCircle } from 'lucide-react';

export const AdjustmentsPage = () => {
  const toast = useToast();

  const adjustments = useInventoryStore((state) => state.adjustments);
  const products = useInventoryStore((state) => state.products);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const addAdjustment = useInventoryStore((state) => state.addAdjustment);
  const applyAdjustment = useInventoryStore((state) => state.applyAdjustment);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdjToApply, setSelectedAdjToApply] = useState(null);

  const filteredAdjustments = adjustments.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = a.reference.toLowerCase().includes(q);
      const matchProd = a.productName.toLowerCase().includes(q);
      const matchReason = a.reason.toLowerCase().includes(q);
      if (!matchRef && !matchProd && !matchReason) return false;
    }
    return true;
  });

  const handleCreateAdjustment = (data) => {
    const newAdj = addAdjustment(data);
    toast.success('Adjustment Recorded', `Stock audit adjustment ${newAdj.reference} recorded in Draft state.`);
  };

  const handleConfirmApply = () => {
    if (selectedAdjToApply) {
      applyAdjustment(selectedAdjToApply.id);
      toast.success('Adjustment Applied!', `Stock quantity reconciled for ${selectedAdjToApply.productName}.`);
      setSelectedAdjToApply(null);
    }
  };

  const allLocations = warehouses.flatMap(w => w.locations);

  return (
    <div>
      <PageHeader
        title="Inventory Stock Adjustments"
        description="Reconcile discrepancy between system-recorded stock quantities and physical count audits."
      >
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
          New Adjustment
        </Button>
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/ADJ/...), product, reason..."
          className="w-full md:w-80"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Applied">Applied</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredAdjustments.length === 0 ? (
            <EmptyState
              title="No inventory adjustments recorded"
              description="No physical inventory count audit adjustments match your query."
              actionLabel="Create Adjustment"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Counted</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">{a.reference}</TableCell>
                    <TableCell className="text-slate-500">{a.date}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{a.location}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{a.productName}</TableCell>
                    <TableCell className="text-slate-700">{a.recordedQty}</TableCell>
                    <TableCell className="font-bold text-slate-900">{a.countedQty}</TableCell>
                    <TableCell className={`font-bold ${a.adjustmentQty >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {a.adjustmentQty >= 0 ? `+${a.adjustmentQty}` : a.adjustmentQty}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">{a.reason}</TableCell>
                    <TableCell>
                      <Badge>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status !== 'Applied' ? (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => setSelectedAdjToApply(a)}
                        >
                          Apply Adjustment
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">Applied</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <AdjustmentFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAdjustment}
          products={products}
          locations={allLocations}
        />
      )}

      {/* Apply Confirmation */}
      {selectedAdjToApply && (
        <ConfirmModal
          isOpen={!!selectedAdjToApply}
          onClose={() => setSelectedAdjToApply(null)}
          onConfirm={handleConfirmApply}
          title={`Apply Adjustment ${selectedAdjToApply.reference}`}
          description={`Applying this adjustment will modify system stock for ${selectedAdjToApply.productName} by ${selectedAdjToApply.adjustmentQty >= 0 ? '+' : ''}${selectedAdjToApply.adjustmentQty}.`}
          confirmText="Apply & Adjust Stock"
          variant="success"
        />
      )}
    </div>
  );
};
