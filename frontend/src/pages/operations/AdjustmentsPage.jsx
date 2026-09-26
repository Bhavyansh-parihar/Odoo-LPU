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
import { AdjustmentFormModal } from '../../components/operations/AdjustmentFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import {
  Plus,
  CheckCircle,
  Printer,
  LayoutGrid,
  List,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const AdjustmentsPage = () => {
  const toast = useToast();

  const adjustments = useInventoryStore((state) => state.adjustments);
  const products = useInventoryStore((state) => state.products);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const addAdjustment = useInventoryStore((state) => state.addAdjustment);
  const applyAdjustment = useInventoryStore((state) => state.applyAdjustment);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
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

  const handlePrintAdjustment = (adj) => {
    toast.info('Printing Audit Note', `Opening print preview for ${adj.reference}...`);
    window.print();
  };

  const getStepProgress = (status) => {
    switch (status) {
      case 'Draft': return 1;
      case 'Applied': return 2;
      default: return 1;
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

      {/* Search & Filter Header with Grid/Table View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/ADJ/...), product, reason..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Applied">Applied</option>
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

      {filteredAdjustments.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              title="No inventory adjustments recorded"
              description="No physical inventory count audit adjustments match your query."
              actionLabel="Create Adjustment"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAdjustments.map((a) => {
            const currentStep = getStepProgress(a.status);
            return (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{a.reference}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{a.productName}</p>
                    </div>
                    <Badge>{a.status}</Badge>
                  </div>

                  {/* Location Info */}
                  <div className="text-xs font-medium text-slate-600 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      Location: <span className="font-mono text-indigo-700 font-bold">{a.location}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{a.date}</span>
                  </div>

                  {/* Audit Diff Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Recorded</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{a.recordedQty}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Counted</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{a.countedQty}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Adjustment</p>
                      <p className={`text-sm font-bold mt-0.5 ${a.adjustmentQty >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {a.adjustmentQty >= 0 ? `+${a.adjustmentQty}` : a.adjustmentQty}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Stepper */}
                  <div className="py-1">
                    <div className="relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
                        style={{
                          width: currentStep === 1 ? '0%' : '100%'
                        }}
                      />

                      <div className="relative z-10 flex justify-between items-center">
                        {['Draft', 'Applied'].map((stepName, stepIdx) => {
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

                  {/* Audit Reason */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Audit Reason: </span>
                    <span>{a.reason}</span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {a.status !== 'Applied' && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => setSelectedAdjToApply(a)}
                        >
                          Apply Adjustment
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Printer}
                        title="Print Adjustment Note"
                        onClick={() => handlePrintAdjustment(a)}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Counted</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right print:hidden">Action</TableHead>
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
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Printer}
                          title="Print Adjustment Note"
                          onClick={() => handlePrintAdjustment(a)}
                        >
                          Print
                        </Button>
                        {a.status !== 'Applied' ? (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => setSelectedAdjToApply(a)}
                          >
                            Apply
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">Applied</span>
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
