import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { ReceiptFormModal } from '../../components/operations/ReceiptFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import {
  Plus,
  CheckCircle,
  Eye,
  Printer,
  LayoutGrid,
  List,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const ReceiptsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const receipts = useInventoryStore((state) => state.receipts);
  const products = useInventoryStore((state) => state.products);
  const addReceipt = useInventoryStore((state) => state.addReceipt);
  const validateReceipt = useInventoryStore((state) => state.validateReceipt);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
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
    toast.success('Receipt Created', `Incoming Receipt ${newRec.reference} recorded in Dispatched state.`);
  };

  const handleConfirmValidate = () => {
    if (selectedReceiptToValidate) {
      validateReceipt(selectedReceiptToValidate.id);
      toast.success('Receipt Validated!', `Stock balances updated for receipt ${selectedReceiptToValidate.reference}.`);
      setSelectedReceiptToValidate(null);
    }
  };

  const handlePrintReceipt = (receipt) => {
    toast.info('Printing Receipt', `Opening print preview for ${receipt.reference}...`);
    window.print();
  };

  const getStepProgress = (status) => {
    switch (status) {
      case 'Dispatched': return 1;
      case 'Arrived': return 2;
      case 'Done': return 3;
      default: return 1;
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

      {/* Search & Filter Header with Grid/Table View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by receipt ref (WH/IN/...), supplier..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Arrived">Arrived</option>
            <option value="Done">Done (Validated)</option>
          </select>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              title="No incoming receipts found"
              description="No vendor receipt documents match your search criteria."
              actionLabel="Create First Receipt"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReceipts.map((r) => {
            const currentStep = getStepProgress(r.status);
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{r.reference}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{r.supplier}</p>
                    </div>
                    <Badge>{r.status}</Badge>
                  </div>

                  {/* Route */}
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">{r.supplier}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-indigo-700 font-bold">{r.destinationLocation}</span>
                  </div>

                  {/* Progress Bar Stepper */}
                  <div className="py-1">
                    <div className="relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
                        style={{
                          width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                        }}
                      />

                      <div className="relative z-10 flex justify-between items-center">
                        {['Dispatched', 'Arrived', 'Done'].map((stepName, stepIdx) => {
                          const stepNumber = stepIdx + 1;
                          const isPassed = currentStep >= stepNumber;
                          const isCurrent = currentStep === stepNumber;

                          return (
                            <div key={stepName} className="flex flex-col items-center">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                  isPassed
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'bg-white border-slate-300'
                                } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
                              />
                              <span
                                className={`text-[10px] mt-1 font-medium ${
                                  isPassed ? 'text-slate-800 font-semibold' : 'text-slate-400'
                                }`}
                              >
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {r.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.productName}</span>
                        <span className="font-bold text-slate-900">{item.qtyExpected} units</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
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
                        onClick={() => navigate(`/operations/receipts/${r.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Printer}
                        title="Print Receipt Slip"
                        onClick={() => handlePrintReceipt(r)}
                      />
                    </div>

                    <Link
                      to="/move-history"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Move history <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead>Supplier / Vendor</TableHead>
                  <TableHead>Destination Location</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right print:hidden">Actions</TableHead>
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
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Printer}
                          title="Print Receipt Slip"
                          onClick={() => handlePrintReceipt(r)}
                        >
                          Print
                        </Button>
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
          </CardContent>
        </Card>
      )}

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
