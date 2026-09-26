import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { TransferFormModal } from '../../components/operations/TransferFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { Plus, ArrowRightLeft, CheckCircle } from 'lucide-react';

export const TransfersPage = () => {
  const toast = useToast();

  const transfers = useInventoryStore((state) => state.transfers);
  const products = useInventoryStore((state) => state.products);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const addTransfer = useInventoryStore((state) => state.addTransfer);
  const validateTransfer = useInventoryStore((state) => state.validateTransfer);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransferToValidate, setSelectedTransferToValidate] = useState(null);

  const filteredTransfers = transfers.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = t.reference.toLowerCase().includes(q);
      const matchSource = t.sourceLocation.toLowerCase().includes(q);
      const matchDest = t.destinationLocation.toLowerCase().includes(q);
      if (!matchRef && !matchSource && !matchDest) return false;
    }
    return true;
  });

  const handleCreateTransfer = (data) => {
    const newTrf = addTransfer(data);
    toast.success('Transfer Scheduled', `Internal Transfer ${newTrf.reference} created.`);
  };

  const handleConfirmValidate = () => {
    if (selectedTransferToValidate) {
      validateTransfer(selectedTransferToValidate.id);
      toast.success('Transfer Validated!', `Stock moved from ${selectedTransferToValidate.sourceLocation} to ${selectedTransferToValidate.destinationLocation}.`);
      setSelectedTransferToValidate(null);
    }
  };

  const allLocations = warehouses.flatMap(w => w.locations);

  return (
    <div>
      <PageHeader
        title="Internal Stock Transfers"
        description="Relocate inventory items between internal warehouse bays, hubs, and retail depots."
      >
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
          New Internal Transfer
        </Button>
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/INT/...), location..."
          className="w-full md:w-80"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="Ready">Ready</option>
          <option value="Done">Done (Validated)</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredTransfers.length === 0 ? (
            <EmptyState
              title="No internal transfers found"
              description="No stock movement records match your search filter."
              actionLabel="Create Transfer"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Transfer Date</TableHead>
                  <TableHead>Source Location</TableHead>
                  <TableHead>Destination Location</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">{t.reference}</TableCell>
                    <TableCell className="text-slate-500">{t.date}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-800">{t.sourceLocation}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-indigo-600">{t.destinationLocation}</TableCell>
                    <TableCell className="text-slate-700">{t.items.length} line item(s)</TableCell>
                    <TableCell>
                      <Badge>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status !== 'Done' ? (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => setSelectedTransferToValidate(t)}
                        >
                          Validate Transfer
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">Completed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Transfer Modal */}
      {isCreateModalOpen && (
        <TransferFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTransfer}
          products={products}
          locations={allLocations}
        />
      )}

      {/* Validate Confirmation */}
      {selectedTransferToValidate && (
        <ConfirmModal
          isOpen={!!selectedTransferToValidate}
          onClose={() => setSelectedTransferToValidate(null)}
          onConfirm={handleConfirmValidate}
          title={`Validate Internal Transfer ${selectedTransferToValidate.reference}`}
          description={`Validating will move stock from ${selectedTransferToValidate.sourceLocation} to ${selectedTransferToValidate.destinationLocation}.`}
          confirmText="Validate & Execute Move"
          variant="success"
        />
      )}
    </div>
  );
};
