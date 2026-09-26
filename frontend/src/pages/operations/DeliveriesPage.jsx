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
import { DeliveryFormModal } from '../../components/operations/DeliveryFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import {
  Plus,
  CheckCircle,
  PackageCheck,
  BoxSelect,
  Eye,
  Printer,
  LayoutGrid,
  List,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const DeliveriesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const deliveries = useInventoryStore((state) => state.deliveries);
  const products = useInventoryStore((state) => state.products);
  const addDelivery = useInventoryStore((state) => state.addDelivery);
  const updateDeliveryStatus = useInventoryStore((state) => state.updateDeliveryStatus);
  const validateDelivery = useInventoryStore((state) => state.validateDelivery);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDeliveryToValidate, setSelectedDeliveryToValidate] = useState(null);

  const filteredDeliveries = deliveries.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = d.reference.toLowerCase().includes(q);
      const matchCustomer = d.customer.toLowerCase().includes(q);
      if (!matchRef && !matchCustomer) return false;
    }
    return true;
  });

  const handleCreateDelivery = (data) => {
    const newDel = addDelivery(data);
    toast.success('Delivery Created', `Outbound delivery order ${newDel.reference} created in Draft state.`);
  };

  const handlePick = (id) => {
    updateDeliveryStatus(id, 'Picked');
    toast.info('Items Picked', 'Products picked from storage location.');
  };

  const handlePack = (id) => {
    updateDeliveryStatus(id, 'Packed');
    toast.info('Order Packed', 'Shipment box packed and ready for dispatch.');
  };

  const handleConfirmValidate = () => {
    if (selectedDeliveryToValidate) {
      validateDelivery(selectedDeliveryToValidate.id);
      toast.success('Delivery Delivered & Validated!', `Stock decremented for delivery ${selectedDeliveryToValidate.reference}.`);
      setSelectedDeliveryToValidate(null);
    }
  };

  const handlePrintDelivery = (delivery) => {
    toast.info('Printing Delivery Slip', `Opening print preview for ${delivery.reference}...`);
    window.print();
  };

  // Status Stepper Progress Helper
  const getStepProgress = (status) => {
    switch (status) {
      case 'Draft': return 1;
      case 'Picked': return 2;
      case 'Packed': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div>
      <PageHeader
        title="Delivery Orders (Stock Out)"
        description="Pick, pack, and validate customer dispatch shipments from warehouse storage."
      >
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
          Create Delivery Order
        </Button>
      </PageHeader>

      {/* Search & Filter Header with Grid/Table View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/OUT/...), customer..."
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
            <option value="Picked">Picked</option>
            <option value="Packed">Packed</option>
            <option value="Delivered">Delivered</option>
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

      {filteredDeliveries.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              title="No delivery orders found"
              description="No outbound delivery orders match your query."
              actionLabel="Create Delivery Order"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDeliveries.map((d) => {
            const currentStep = getStepProgress(d.status);
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{d.reference}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{d.customer}</p>
                    </div>
                    <Badge>{d.status}</Badge>
                  </div>

                  {/* Route */}
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-mono text-slate-700 font-bold">{d.sourceLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Customer Address ({d.customer})</span>
                  </div>

                  {/* Progress Bar Stepper */}
                  <div className="py-1">
                    <div className="relative">
                      {/* Background Bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
                      {/* Active Progress Bar */}
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
                        style={{
                          width:
                            currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%'
                        }}
                      />

                      {/* Step Nodes */}
                      <div className="relative z-10 flex justify-between items-center">
                        {['Draft', 'Picked', 'Packed', 'Delivered'].map((stepName, stepIdx) => {
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

                  {/* Products Summary Breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {d.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.productName}</span>
                        <span className="font-bold text-slate-900">{item.qtyDemand} units</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {d.status === 'Draft' && (
                        <Button variant="primary" size="sm" icon={BoxSelect} onClick={() => handlePick(d.id)}>
                          Pick
                        </Button>
                      )}
                      {d.status === 'Picked' && (
                        <Button variant="primary" size="sm" icon={PackageCheck} onClick={() => handlePack(d.id)}>
                          Pack
                        </Button>
                      )}
                      {d.status === 'Packed' && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => setSelectedDeliveryToValidate(d)}
                        >
                          Validate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/operations/deliveries/${d.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Printer}
                        title="Print Delivery Slip"
                        onClick={() => handlePrintDelivery(d)}
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
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Customer / Recipient</TableHead>
                  <TableHead>Source Location</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right print:hidden">Workflow Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">{d.reference}</TableCell>
                    <TableCell className="text-slate-500">{d.date}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{d.customer}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{d.sourceLocation}</TableCell>
                    <TableCell className="text-slate-700">{d.items.length} line item(s)</TableCell>
                    <TableCell>
                      <Badge>{d.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Printer}
                          title="Print Delivery Note"
                          onClick={() => handlePrintDelivery(d)}
                        >
                          Print
                        </Button>
                        {d.status === 'Draft' && (
                          <Button variant="outline" size="sm" icon={BoxSelect} onClick={() => handlePick(d.id)}>
                            Pick
                          </Button>
                        )}
                        {d.status === 'Picked' && (
                          <Button variant="outline" size="sm" icon={PackageCheck} onClick={() => handlePack(d.id)}>
                            Pack
                          </Button>
                        )}
                        {(d.status === 'Packed' || d.status === 'Draft' || d.status === 'Picked') && d.status !== 'Delivered' && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => setSelectedDeliveryToValidate(d)}
                          >
                            Validate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => navigate(`/operations/deliveries/${d.id}`)}
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

      {/* Create Delivery Modal */}
      {isCreateModalOpen && (
        <DeliveryFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateDelivery}
          products={products}
        />
      )}

      {/* Confirm Delivery Validate */}
      {selectedDeliveryToValidate && (
        <ConfirmModal
          isOpen={!!selectedDeliveryToValidate}
          onClose={() => setSelectedDeliveryToValidate(null)}
          onConfirm={handleConfirmValidate}
          title={`Validate & Dispatch Delivery ${selectedDeliveryToValidate.reference}`}
          description={`Validating will deduct stock quantities permanently for ${selectedDeliveryToValidate.items.length} items.`}
          confirmText="Validate & Dispatch"
          variant="success"
        />
      )}
    </div>
  );
};
