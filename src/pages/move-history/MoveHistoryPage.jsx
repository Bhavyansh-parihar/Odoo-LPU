import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, ArrowRight } from 'lucide-react';

export const MoveHistoryPage = () => {
  const moveHistory = useInventoryStore((state) => state.moveHistory);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredMoves = moveHistory.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = m.reference.toLowerCase().includes(q);
      const matchProd = m.product.toLowerCase().includes(q);
      const matchContact = m.contact.toLowerCase().includes(q);
      const matchSource = m.source.toLowerCase().includes(q);
      const matchDest = m.destination.toLowerCase().includes(q);
      if (!matchRef && !matchProd && !matchContact && !matchSource && !matchDest) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Stock Move History Ledger"
        description="Audit-compliant log of all historical inventory movements, receipts, dispatches, and adjustments."
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ref, product, contact, source/destination..."
          className="w-full md:w-96"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="Done">Done</option>
          <option value="Pending">Pending / In-Transit</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredMoves.length === 0 ? (
            <EmptyState
              icon={History}
              title="No stock movement ledger records"
              description="No historical moves match your search query."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Contact / Partner</TableHead>
                  <TableHead>Source → Destination</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoves.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">{m.reference}</TableCell>
                    <TableCell className="text-slate-500 text-xs font-medium">{m.date}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{m.contact}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">{m.source}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm font-medium">{m.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{m.product}</TableCell>
                    <TableCell className={`font-bold ${m.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.quantity >= 0 ? `+${m.quantity}` : m.quantity}
                    </TableCell>
                    <TableCell>
                      <Badge>{m.status}</Badge>
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
