import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { MapPin } from 'lucide-react';

export const StockByLocationTable = ({ stockByLocation = [], uom = 'pcs' }) => {
  if (stockByLocation.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        No specific location inventory recorded.
      </div>
    );
  }

  return (
    <Card className="border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location Code</TableHead>
            <TableHead>Quantity Available</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockByLocation.map((loc, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {loc.locationCode}
              </TableCell>
              <TableCell className="font-medium text-slate-800">{loc.qty}</TableCell>
              <TableCell className="text-slate-500">{uom}</TableCell>
              <TableCell>
                {loc.qty > 0 ? (
                  <Badge variant="In Stock">In Stock</Badge>
                ) : (
                  <Badge variant="Out of Stock">Out of Stock</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
import { Card } from '../ui/Card';
