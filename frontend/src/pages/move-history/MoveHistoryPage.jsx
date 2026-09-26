import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { MoveDetailModal } from '../../components/move-history/MoveDetailModal';
import { MoveFormModal } from '../../components/move-history/MoveFormModal';
import { useToast } from '../../hooks/useToast';
import {
  History,
  ArrowRight,
  Printer,
  LayoutGrid,
  List,
  Calendar,
  UserCheck,
  Eye,
  Plus,
  ExternalLink,
  PackageCheck
} from 'lucide-react';

export const MoveHistoryPage = () => {
  const toast = useToast();
  const moveHistory = useInventoryStore((state) => state.moveHistory);
  const products = useInventoryStore((state) => state.products);
  const addMoveHistory = useInventoryStore((state) => state.addMoveHistory);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedMove, setSelectedMove] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredMoves = moveHistory.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (typeFilter !== 'ALL') {
      if (!m.reference.startsWith(typeFilter)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = m.reference.toLowerCase().includes(q);
      const matchProd = m.product.toLowerCase().includes(q);
      const matchContact = m.contact ? m.contact.toLowerCase().includes(q) : false;
      const matchSource = m.source.toLowerCase().includes(q);
      const matchDest = m.destination.toLowerCase().includes(q);
      if (!matchRef && !matchProd && !matchContact && !matchSource && !matchDest) return false;
    }
    return true;
  });

  const handleCreateMove = (moveData) => {
    addMoveHistory(moveData);
    toast.success('Stock Move Recorded', `Stock movement ${moveData.reference} added to history ledger.`);
  };

  const handlePrintMove = (move) => {
    toast.info('Printing Move Slip', `Opening print preview for ${move.reference}...`);
    window.print();
  };

  const getStepProgress = (status) => {
    switch (status) {
      case 'Draft':
      case 'Scheduled':
        return 1;
      case 'Pending':
      case 'Picked':
      case 'In-Transit':
        return 2;
      case 'Done':
      case 'Completed':
      default:
        return 3;
    }
  };

  const getModuleLink = (reference) => {
    if (reference.startsWith('WH/IN')) return { label: 'Receipts', url: '/operations/receipts' };
    if (reference.startsWith('WH/OUT')) return { label: 'Deliveries', url: '/operations/deliveries' };
    if (reference.startsWith('WH/INT')) return { label: 'Transfers', url: '/operations/transfers' };
    if (reference.startsWith('WH/ADJ')) return { label: 'Adjustments', url: '/operations/adjustments' };
    return null;
  };

  return (
    <div>
      <PageHeader
        title="Stock Move History Ledger"
        description="Audit-compliant log of all historical inventory movements, receipts, dispatches, and adjustments."
      >
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
          Record Stock Move
        </Button>
      </PageHeader>

      {/* Search & Filter Header with Grid/Table View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/...), product, contact, location..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="WH/IN">Receipts (WH/IN)</option>
            <option value="WH/OUT">Deliveries (WH/OUT)</option>
            <option value="WH/INT">Transfers (WH/INT)</option>
            <option value="WH/ADJ">Adjustments (WH/ADJ)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Done">Done (Completed)</option>
            <option value="Pending">Pending / In-Transit</option>
            <option value="Picked">Picked</option>
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

      {filteredMoves.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={History}
              title="No stock movement ledger records"
              description="No historical moves match your search query."
              actionLabel="Record Stock Move"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View (Operations Style) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMoves.map((m) => {
            const currentStep = getStepProgress(m.status);
            const moduleLink = getModuleLink(m.reference);
            const isPositive = Number(m.quantity) >= 0;

            return (
              <Card key={m.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{m.reference}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" /> {m.contact || 'System Generated'}
                      </p>
                    </div>
                    <Badge>{m.status}</Badge>
                  </div>

                  {/* Route Line */}
                  <div className="text-xs font-medium text-slate-600 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-700 font-bold">{m.source}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-indigo-700 font-bold">{m.destination}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 shrink-0 ml-2">
                      <Calendar className="w-3 h-3" /> {m.date}
                    </span>
                  </div>

                  {/* Progress Stepper Bar */}
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
                        {['Draft', 'In-Transit', 'Done'].map((stepName, stepIdx) => {
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

                  {/* Product & Quantity Item Breakdown */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-900">{m.product}</span>
                    </div>
                    <span className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? `+${m.quantity}` : m.quantity} units
                    </span>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedMove(m)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Printer}
                        title="Print Move Slip"
                        onClick={() => handlePrintMove(m)}
                      >
                        Print
                      </Button>
                    </div>

                    {moduleLink ? (
                      <Link
                        to={moduleLink.url}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        {moduleLink.label} <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">{m.reference}</span>
                    )}
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Contact / Partner</TableHead>
                  <TableHead>Source → Destination</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity Delta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right print:hidden">Workflow Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoves.map((m) => {
                  const isPositive = Number(m.quantity) >= 0;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs font-bold text-indigo-600">{m.reference}</TableCell>
                      <TableCell className="text-slate-500 text-xs font-medium">{m.date}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{m.contact || 'System'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">{m.source}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm font-medium">{m.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">{m.product}</TableCell>
                      <TableCell className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? `+${m.quantity}` : m.quantity}
                      </TableCell>
                      <TableCell>
                        <Badge>{m.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Printer}
                            title="Print Move Slip"
                            onClick={() => handlePrintMove(m)}
                          >
                            Print
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedMove(m)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Move Detail View Modal */}
      {selectedMove && (
        <MoveDetailModal
          isOpen={!!selectedMove}
          onClose={() => setSelectedMove(null)}
          move={selectedMove}
          onPrint={handlePrintMove}
        />
      )}

      {/* Record Stock Move Form Modal */}
      {isCreateModalOpen && (
        <MoveFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMove}
          products={products}
        />
      )}
    </div>
  );
};
