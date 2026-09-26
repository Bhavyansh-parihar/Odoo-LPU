import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { Warehouse, MapPin, Plus, Edit, User, Phone, Map } from 'lucide-react';

export const WarehouseSettingsPage = () => {
  const toast = useToast();
  const warehouses = useInventoryStore((state) => state.warehouses);
  const updateWarehouse = useInventoryStore((state) => state.updateWarehouse);
  const addLocationToWarehouse = useInventoryStore((state) => state.addLocationToWarehouse);

  const [activeWhId, setActiveWhId] = useState(warehouses[0]?.id || 'wh-1');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newLocCode, setNewLocCode] = useState('');
  const [newLocName, setNewLocName] = useState('');

  const activeWarehouse = warehouses.find((w) => w.id === activeWhId) || warehouses[0];

  if (!activeWarehouse) {
    return <div className="p-8 text-center text-slate-500">Loading warehouse data or no warehouses available...</div>;
  }

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocCode || !newLocName) return;
    addLocationToWarehouse(activeWarehouse.id, {
      code: newLocCode,
      name: newLocName,
      type: 'Internal'
    });
    toast.success('Location Added', `Location ${newLocCode} added to ${activeWarehouse.name}.`);
    setNewLocCode('');
    setNewLocName('');
    setIsLocationModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse & Location Settings"
        description="Manage warehouse facilities, internal storage locations, receiving bays, and site managers."
      />

      {/* Warehouse Selector Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        {warehouses.map((wh) => (
          <button
            key={wh.id}
            onClick={() => setActiveWhId(wh.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeWhId === wh.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>{wh.code} - {wh.name}</span>
          </button>
        ))}
      </div>

      {/* Active Warehouse Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Warehouse Code & Name</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{activeWarehouse.code} - {activeWarehouse.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Facility Manager</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{activeWarehouse.manager}</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {activeWarehouse.phone}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Physical Address</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">{activeWarehouse.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Locations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Internal Locations inside {activeWarehouse.code}</CardTitle>
            <Button size="sm" onClick={() => setIsLocationModalOpen(true)} icon={Plus}>
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Code</TableHead>
                <TableHead>Location Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent Warehouse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeWarehouse.locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-mono text-xs font-bold text-indigo-600 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {loc.code}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{loc.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-medium bg-slate-100 text-slate-700">
                      {loc.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{activeWarehouse.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Location Modal */}
      <Dialog
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title={`Add Storage Location to ${activeWarehouse.code}`}
        description="Define a new internal stock location or shelf bay"
      >
        <form onSubmit={handleAddLocation} className="space-y-4">
          <Input
            label="Location Code *"
            placeholder="e.g. WH/Stock/Bay-A"
            value={newLocCode}
            onChange={(e) => setNewLocCode(e.target.value)}
            required
          />
          <Input
            label="Location Name *"
            placeholder="e.g. High-Rack Storage Bay A"
            value={newLocName}
            onChange={(e) => setNewLocName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsLocationModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Location
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
