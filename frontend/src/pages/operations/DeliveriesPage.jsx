import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate } from 'react-router-dom';
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
import { Plus, CheckCircle, PackageCheck, BoxSelect, Eye } from 'lucide-react';

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
      toast.success('Delivery Dispatched & Validated!', `Stock decremented for delivery ${selectedDeliveryToValidate.reference}.`);
      setSelectedDeliveryToValidate(null);
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

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ref (WH/OUT/...), customer..."
          className="w-full md:w-80"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Picked">Picked</option>
          <option value="Packed">Packed</option>
          <option value="Done">Done (Dispatched)</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredDeliveries.length === 0 ? (
            <EmptyState
              title="No delivery orders found"
              description="No outbound delivery orders match your query."
              actionLabel="Create Delivery Order"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Customer / Recipient</TableHead>
                  <TableHead>Source Location</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Workflow Actions</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                        {(d.status === 'Packed' || d.status === 'Draft' || d.status === 'Picked') && d.status !== 'Done' && (
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
                          variant="ghost"
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
          )}
        </CardContent>
      </Card>

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
