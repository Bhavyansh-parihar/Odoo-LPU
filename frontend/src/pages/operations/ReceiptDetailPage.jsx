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
import { ArrowLeft, CheckCircle, Truck, Calendar, MapPin } from 'lucide-react';

export const ReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const receipts = useInventoryStore((state) => state.receipts);
  const validateReceipt = useInventoryStore((state) => state.validateReceipt);

  const receipt = receipts.find((r) => r.id === id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!receipt) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Receipt Document Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The requested receipt reference does not exist.</p>
        <Button onClick={() => navigate('/operations/receipts')}>Back to Receipts</Button>
      </div>
    );
  }

  const handleValidate = () => {
    validateReceipt(receipt.id);
    toast.success('Receipt Validated', `Stock inventory successfully incremented for ${receipt.reference}.`);
    setIsConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/operations/receipts')}>
        Back to Incoming Receipts List
      </Button>

      <PageHeader
        title={`Receipt ${receipt.reference}`}
        description={`Supplier: ${receipt.supplier} | Destination: ${receipt.destinationLocation}`}
      >
        <Badge>{receipt.status}</Badge>
        {receipt.status !== 'Done' && (
          <Button variant="success" size="sm" icon={CheckCircle} onClick={() => setIsConfirmOpen(true)}>
            Validate Receipt
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Vendor Supplier</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{receipt.supplier}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Scheduled Date</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{receipt.date}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Receiving Location</p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{receipt.destinationLocation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Received Products Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Item</TableHead>
                <TableHead>Expected Quantity</TableHead>
                <TableHead>Received Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-slate-900">{item.productName}</TableCell>
                  <TableCell className="font-medium text-slate-700">{item.qtyExpected}</TableCell>
                  <TableCell className="font-bold text-indigo-600">
                    {receipt.status === 'Done' ? item.qtyExpected : item.qtyReceived}
                  </TableCell>
                  <TableCell>
                    <Badge>{receipt.status === 'Done' ? 'Done' : 'Pending'}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {receipt.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">{receipt.notes}</p>
          </CardContent>
        </Card>
      )}

      {isConfirmOpen && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleValidate}
          title="Confirm Receipt Validation"
          description="Validating this receipt will move stock into warehouse receiving bay and log movement."
          confirmText="Confirm & Receive Stock"
          variant="success"
        />
      )}
    </div>
  );
};
