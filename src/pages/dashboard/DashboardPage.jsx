import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DashboardFilters } from '../../components/dashboard/DashboardFilters';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Plus,
  Eye,
  FileText
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const products = useInventoryStore((state) => state.products);
  const receipts = useInventoryStore((state) => state.receipts);
  const deliveries = useInventoryStore((state) => state.deliveries);
  const transfers = useInventoryStore((state) => state.transfers);
  const adjustments = useInventoryStore((state) => state.adjustments);
  const categories = useInventoryStore((state) => state.categories);
  const warehouses = useInventoryStore((state) => state.warehouses);

  // Filter States
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate KPIs
  const totalProductsInStock = products.reduce((acc, p) => acc + (p.totalStock > 0 ? 1 : 0), 0);
  const lowStockItems = products.filter(p => p.totalStock > 0 && p.totalStock <= p.minStock).length;
  const outOfStockItems = products.filter(p => p.totalStock === 0).length;
  const pendingReceipts = receipts.filter(r => r.status === 'Draft' || r.status === 'Ready').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'Done' && d.status !== 'Cancelled').length;
  const scheduledTransfers = transfers.filter(t => t.status === 'Draft' || t.status === 'Ready').length;

  // Flatten all document operations into a single unified dashboard view
  const allDocuments = [
    ...receipts.map(r => ({
      id: r.id,
      docType: 'Receipt',
      reference: r.reference,
      date: r.date,
      contact: r.supplier,
      location: r.destinationLocation,
      status: r.status,
      itemsCount: r.items.length,
      category: 'Multiple / Supplies',
      rawObj: r,
      targetPath: `/operations/receipts/${r.id}`
    })),
    ...deliveries.map(d => ({
      id: d.id,
      docType: 'Delivery',
      reference: d.reference,
      date: d.date,
      contact: d.customer,
      location: d.sourceLocation,
      status: d.status,
      itemsCount: d.items.length,
      category: 'Outbound Sales',
      rawObj: d,
      targetPath: `/operations/deliveries/${d.id}`
    })),
    ...transfers.map(t => ({
      id: t.id,
      docType: 'Transfer',
      reference: t.reference,
      date: t.date,
      contact: `${t.sourceLocation} → ${t.destinationLocation}`,
      location: t.sourceLocation,
      status: t.status,
      itemsCount: t.items.length,
      category: 'Internal Move',
      rawObj: t,
      targetPath: `/operations/transfers`
    })),
    ...adjustments.map(a => ({
      id: a.id,
      docType: 'Adjustment',
      reference: a.reference,
      date: a.date,
      contact: a.reason,
      location: a.location,
      status: a.status,
      itemsCount: 1,
      category: 'Audit Adjustment',
      rawObj: a,
      targetPath: `/operations/adjustments`
    }))
  ];

  // Apply filters to dashboard document view
  const filteredDocuments = allDocuments.filter((doc) => {
    if (docTypeFilter !== 'ALL' && doc.docType !== docTypeFilter) return false;
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
    if (locationFilter !== 'ALL' && doc.location !== locationFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = doc.reference.toLowerCase().includes(q);
      const matchContact = doc.contact.toLowerCase().includes(q);
      if (!matchRef && !matchContact) return false;
    }
    return true;
  });

  const allLocations = warehouses.flatMap(w => w.locations);

  const resetFilters = () => {
    setDocTypeFilter('ALL');
    setStatusFilter('ALL');
    setLocationFilter('ALL');
    setCategoryFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div>
      <PageHeader
        title="StockSense Inventory Dashboard"
        description="Real-time operational overview of stock levels, pending movements, and warehouse activity."
      >
        <Button size="sm" onClick={() => navigate('/products/new')} icon={Plus}>
          New Product
        </Button>
      </PageHeader>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          title="Total Products in Stock"
          value={totalProductsInStock}
          subtitle={`Across ${products.length} catalog items`}
          icon={Package}
          color="indigo"
          onClick={() => navigate('/products')}
        />
        <KpiCard
          title="Low / Out of Stock"
          value={lowStockItems + outOfStockItems}
          subtitle={`${lowStockItems} Low | ${outOfStockItems} Out of Stock`}
          icon={AlertTriangle}
          color={outOfStockItems > 0 ? 'rose' : 'amber'}
          onClick={() => navigate('/products')}
        />
        <KpiCard
          title="Pending Receipts"
          value={pendingReceipts}
          subtitle="Incoming from suppliers"
          icon={ArrowDownLeft}
          color="emerald"
          onClick={() => navigate('/operations/receipts')}
        />
        <KpiCard
          title="Pending Deliveries"
          value={pendingDeliveries}
          subtitle="Outbound customer orders"
          icon={ArrowUpRight}
          color="sky"
          onClick={() => navigate('/operations/deliveries')}
        />
        <KpiCard
          title="Scheduled Transfers"
          value={scheduledTransfers}
          subtitle="Internal stock moves"
          icon={ArrowRightLeft}
          color="purple"
          onClick={() => navigate('/operations/transfers')}
        />
      </div>

      {/* Filters */}
      <DashboardFilters
        docTypeFilter={docTypeFilter}
        setDocTypeFilter={setDocTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        locations={allLocations}
        categories={categories}
        onReset={resetFilters}
      />

      {/* Operations Document Stream Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <CardTitle>Inventory Document Ledger & Activity Stream</CardTitle>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search reference, contact, supplier..."
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <EmptyState
              title="No document operations found"
              description="No inventory documents match your current selected filter criteria."
              actionLabel="Reset Filters"
              onAction={resetFilters}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact / Details</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-semibold text-indigo-600">{doc.reference}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {doc.docType}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">{doc.date}</TableCell>
                    <TableCell className="font-medium text-slate-800">{doc.contact}</TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs">{doc.location}</TableCell>
                    <TableCell className="text-slate-600">{doc.itemsCount} line item(s)</TableCell>
                    <TableCell>
                      <Badge>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(doc.targetPath)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
