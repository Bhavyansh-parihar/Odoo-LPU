import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Printer, ArrowRight, Calendar, UserCheck, MapPin, PackageCheck, Hash } from 'lucide-react';

export const MoveDetailModal = ({ isOpen, onClose, move, onPrint }) => {
  if (!move) return null;

  const isPositive = Number(move.quantity) >= 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock Move Slip - ${move.reference}`}
      description="Audit detail record for historical inventory movement"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Header Summary Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Transaction Ref</span>
            <p className="font-mono text-base font-bold text-indigo-600 flex items-center gap-1.5 mt-0.5">
              <Hash className="w-4 h-4 text-indigo-500" />
              {move.reference}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Status</span>
            <Badge className="mt-1">{move.status}</Badge>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Partner / Contact
            </span>
            <p className="text-xs font-bold text-slate-900">{move.contact || 'System Generated'}</p>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp
            </span>
            <p className="text-xs font-bold text-slate-900">{move.date}</p>
          </div>
        </div>

        {/* Route Details Box */}
        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/80 space-y-2">
          <span className="text-[11px] uppercase font-bold text-indigo-800 tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Transfer Route Path
          </span>
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Source Location</p>
              <p className="font-mono text-xs font-bold text-slate-800">{move.source}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mx-2" />
            <div className="text-right">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Destination Location</p>
              <p className="font-mono text-xs font-bold text-indigo-700">{move.destination}</p>
            </div>
          </div>
        </div>

        {/* Product Impact Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{move.product}</p>
              <p className="text-[11px] text-slate-500">Stock Movement Line Item</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quantity Delta</span>
            <span
              className={`text-sm font-extrabold ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? `+${move.quantity}` : move.quantity} units
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={() => {
              onPrint(move);
              onClose();
            }}
          >
            Print Move Slip
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
