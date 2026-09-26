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
import { TransferFormModal } from '../../components/operations/TransferFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import {
  Plus,
  ArrowRightLeft,
  CheckCircle,
  Printer,
  LayoutGrid,
  List,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const TransfersPage = () => {
  const toast = useToast();

  const transfers = useInventoryStore((state) => state.transfers);
  const products = useInventoryStore((state) => state.products);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const addTransfer = useInventoryStore((state) => state.addTransfer);
  const validateTransfer = useInventoryStore((state) => state.validateTransfer);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
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

  const handleCreateTransfer = async (data) => {
    const newTrf = await addTransfer(data);
    toast.success('Transfer Scheduled', `Internal Transfer ${newTrf.reference} created.`);
  };

  const handleConfirmValidate = () => {
    if (selectedTransferToValidate) {
      validateTransfer(selectedTransferToValidate.id);
      toast.success('Transfer Validated!', `Stock moved from ${selectedTransferToValidate.sourceLocation} to ${selectedTransferToValidate.destinationLocation}.`);
      setSelectedTransferToValidate(null);
    }
  };

  const handlePrintTransfer = (transfer) => {
    toast.info('Printing Transfer Note', `Opening print preview for ${transfer.reference}...`);
    window.print();
  };

  const getStepProgress = (status) => {
    switch (status) {
      case 'Draft': return 1;
      case 'Ready': return 2;
      case 'Done': return 3;
      default: return 1;
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

      {/* Search & Filter Header with Grid/Table View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/INT/...), location..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Ready">Ready</option>
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

      {filteredTransfers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              title="No internal transfers found"
              description="No stock movement records match your search filter."
              actionLabel="Create Transfer"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTransfers.map((t) => {
            const currentStep = getStepProgress(t.status);
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{t.reference}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{t.date}</p>
                    </div>
                    <Badge>{t.status}</Badge>
                  </div>

                  {/* Route */}
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-mono text-slate-800 font-bold">{t.sourceLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-indigo-700 font-bold">{t.destinationLocation}</span>
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
                        {['Draft', 'Ready', 'Done'].map((stepName, stepIdx) => {
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
                    {
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{t.product?.name || "Unknown Product"}</span>
                        <span className="font-bold text-slate-900">{t.quantity} units</span>
                      </div>
                    }
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {t.status !== 'Done' && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => setSelectedTransferToValidate(t)}
                        >
                          Validate Transfer
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Printer}
                        title="Print Transfer Note"
                        onClick={() => handlePrintTransfer(t)}
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
                  <TableHead>Transfer Date</TableHead>
                  <TableHead>Source Location</TableHead>
                  <TableHead>Destination Location</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right print:hidden">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">{t.reference}</TableCell>
                    <TableCell className="text-slate-500">{t.date}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-800">{t.sourceLocation}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-indigo-600">{t.destinationLocation}</TableCell>
                    <TableCell className="text-slate-700">1 line item</TableCell>
                    <TableCell>
                      <Badge>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Printer}
                          title="Print Transfer Note"
                          onClick={() => handlePrintTransfer(t)}
                        >
                          Print
                        </Button>
                        {t.status !== 'Done' ? (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => setSelectedTransferToValidate(t)}
                          >
                            Validate
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">Completed</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
