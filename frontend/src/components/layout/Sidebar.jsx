import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  Warehouse,
  User,
  ChevronDown,
  Boxes,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = ({ isOpen = true, onClose }) => {
  const [isOpsOpen, setIsOpsOpen] = useState(true);
  const { user } = useAuthStore();

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package }
  ];

  const operationsNav = [
    { name: 'Receipts', path: '/operations/receipts', icon: ArrowDownLeft },
    { name: 'Delivery Orders', path: '/operations/deliveries', icon: ArrowUpRight },
    { name: 'Internal Transfers', path: '/operations/transfers', icon: ArrowRightLeft },
    { name: 'Inventory Adjustments', path: '/operations/adjustments', icon: SlidersHorizontal }
  ];

  const secondaryNav = [
    { name: 'Move History', path: '/move-history', icon: History },
    { name: 'Warehouse Settings', path: '/settings/warehouse', icon: Warehouse },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  if (user?.role === 'manager') {
    secondaryNav.splice(2, 0, { name: 'User Management', path: '/settings/users', icon: User });
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-2xs"
        onClick={onClose}
      />

      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen fixed md:relative z-40 transition-all duration-200 shadow-xl md:shadow-none">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">StockSense</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Inventory ERP</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
          {/* Main Section */}
          <div>
            <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Operations Accordion */}
          <div>
            <button
              onClick={() => setIsOpsOpen(!isOpsOpen)}
              className="w-full flex items-center justify-between px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 hover:text-slate-300 transition-colors"
            >
              <span>Operations</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpsOpen && (
              <nav className="space-y-1">
                {operationsNav.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'hover:bg-slate-800 hover:text-white text-slate-400'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

          {/* Management & Settings */}
          <div>
            <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Management</p>
            <nav className="space-y-1">
              {secondaryNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">StockSense v2.4 Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
