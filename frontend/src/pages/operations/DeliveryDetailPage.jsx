import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, CheckCircle, User, Calendar, MapPin, BoxSelect, PackageCheck, Printer } from 'lucide-react';

export const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const deliveries = useInventoryStore((state) => state.deliveries);
  const updateDeliveryStatus = useInventoryStore((state) => state.updateDeliveryStatus);
  const validateDelivery = useInventoryStore((state) => state.validateDelivery);

  const delivery = deliveries.find((d) => d.id === id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!delivery) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Delivery Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The requested delivery order reference does not exist.</p>
        <Button onClick={() => navigate('/operations/deliveries')}>Back to Deliveries</Button>
      </div>
    );
  }

  const handlePick = () => {
    updateDeliveryStatus(delivery.id, 'Picked');
    toast.info('Status Updated', 'Items marked as Picked.');
  };

  const handlePack = () => {
    updateDeliveryStatus(delivery.id, 'Packed');
    toast.info('Status Updated', 'Shipment marked as Packed.');
  };

  const handleValidate = () => {
    validateDelivery(delivery.id, delivery.lines?.map(l => ({ product: l.product?._id || l.product, pickedQty: l.orderedQty })));
    toast.success('Delivery Validated', `Stock deducted and order ${delivery.reference} dispatched.`);
    setIsConfirmOpen(false);
  };

  const handlePrint = () => {
    toast.info('Printing Delivery Slip', `Opening print preview for ${delivery.reference}...`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/operations/deliveries')} className="print:hidden">
        Back to Delivery Orders List
      </Button>

      <PageHeader
        title={`Delivery Order ${delivery.reference}`}
        description={`Customer: ${delivery.customer} | Source: ${delivery.sourceLocation}`}
      >
        <Badge>{delivery.status}</Badge>

        <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint} className="print:hidden">
          Print Delivery Slip
        </Button>

        {delivery.status === 'Draft' && (
          <Button variant="outline" size="sm" icon={BoxSelect} onClick={handlePick} className="print:hidden">
            Pick Items
          </Button>
        )}
        {delivery.status === 'Picked' && (
          <Button variant="outline" size="sm" icon={PackageCheck} onClick={handlePack} className="print:hidden">
            Pack Parcel
          </Button>
        )}
        {delivery.status !== 'Delivered' && (
          <Button variant="success" size="sm" icon={CheckCircle} onClick={() => setIsConfirmOpen(true)} className="print:hidden">
            Validate & Dispatch
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Customer / Recipient</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{delivery.customer}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Dispatch Date</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{delivery.date}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Source Storage Location</p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{delivery.sourceLocation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demanded Delivery Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Item</TableHead>
                <TableHead>Demanded Qty</TableHead>
                <TableHead>Dispatched Qty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delivery.lines?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-slate-900">{item.product?.name || "Unknown Product"}</TableCell>
                  <TableCell className="font-medium text-slate-700">{item.qtyDemand}</TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {delivery.status === 'Done' ? item.qtyDemand : item.qtyDone}
                  </TableCell>
                  <TableCell>
                    <Badge>{delivery.status === 'Done' ? 'Done' : delivery.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {delivery.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Order / Dispatch Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">{delivery.notes}</p>
          </CardContent>
        </Card>
      )}

      {isConfirmOpen && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleValidate}
          title="Confirm Delivery Validation"
          description="Validating this order will deduct stock inventory and mark the order as Dispatched."
          confirmText="Confirm & Dispatch"
          variant="success"
        />
      )}
    </div>
  );
};
