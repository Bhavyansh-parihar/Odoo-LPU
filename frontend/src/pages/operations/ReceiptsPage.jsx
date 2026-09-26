import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { ReceiptFormModal } from '../../components/operations/ReceiptFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { Plus, ArrowDownLeft, CheckCircle, Eye } from 'lucide-react';

export const ReceiptsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const receipts = useInventoryStore((state) => state.receipts);
  const products = useInventoryStore((state) => state.products);
  const addReceipt = useInventoryStore((state) => state.addReceipt);
  const validateReceipt = useInventoryStore((state) => state.validateReceipt);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReceiptToValidate, setSelectedReceiptToValidate] = useState(null);

  const filteredReceipts = receipts.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = r.reference.toLowerCase().includes(q);
      const matchSupplier = r.supplier.toLowerCase().includes(q);
      if (!matchRef && !matchSupplier) return false;
    }
    return true;
  });

  const handleCreateReceipt = (data) => {
    const newRec = addReceipt(data);
    toast.success('Receipt Created', `Incoming Receipt ${newRec.reference} recorded in Draft state.`);
  };

  const handleConfirmValidate = () => {
    if (selectedReceiptToValidate) {
      validateReceipt(selectedReceiptToValidate.id);
      toast.success('Receipt Validated!', `Stock balances updated for receipt ${selectedReceiptToValidate.reference}.`);
      setSelectedReceiptToValidate(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Incoming Receipts (Stock In)"
        description="Receive incoming shipments from vendors and suppliers into warehouse receiving bays."
      >
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
          Create Receipt
        </Button>
      </PageHeader>

      {/* Filter & Search Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by receipt ref (WH/IN/...), supplier..."
          className="w-full md:w-80"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Ready">Ready to Receive</option>
          <option value="Done">Done (Validated)</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredReceipts.length === 0 ? (
            <EmptyState
              title="No incoming receipts found"
              description="No vendor receipt documents match your search criteria."
              actionLabel="Create First Receipt"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead>Supplier / Vendor</TableHead>
                  <TableHead>Destination Location</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">{r.reference}</TableCell>
                    <TableCell className="text-slate-500">{r.date}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{r.supplier}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{r.destinationLocation}</TableCell>
                    <TableCell className="text-slate-700">{r.items.length} line item(s)</TableCell>
                    <TableCell>
                      <Badge>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== 'Done' && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => setSelectedReceiptToValidate(r)}
                          >
                            Validate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => navigate(`/operations/receipts/${r.id}`)}
                        >
                          View
                        </Button>
                      </div>
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
        <ReceiptFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateReceipt}
          products={products}
        />
      )}

      {/* Validation Confirmation Modal */}
      {selectedReceiptToValidate && (
        <ConfirmModal
          isOpen={!!selectedReceiptToValidate}
          onClose={() => setSelectedReceiptToValidate(null)}
          onConfirm={handleConfirmValidate}
          title={`Validate Receipt ${selectedReceiptToValidate.reference}`}
          description={`Validating will permanently increment stock quantities for ${selectedReceiptToValidate.items.length} items.`}
          confirmText="Validate & Receive Stock"
          variant="success"
        />
      )}
    </div>
  );
};
