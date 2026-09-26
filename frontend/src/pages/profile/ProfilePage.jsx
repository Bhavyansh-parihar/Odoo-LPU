import React, { useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  User,
  Mail,
  Phone,
  Building,
  Warehouse,
  LogOut,
  ShieldCheck,
  Edit,
  Upload,
  Trash2
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        updateProfile({ avatar: base64Url });
        toast.success('Photo Uploaded', 'Your profile picture has been updated.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    updateProfile({ avatar: null });
    toast.info('Photo Removed', 'Profile picture removed.');
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged Out', 'You have been signed out.');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="My User Profile"
        description="View your account information, warehouse assignment, and profile picture."
      >
        <Button size="sm" icon={Edit} onClick={() => navigate('/profile/edit')}>
          Edit Profile Information
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="relative inline-block mx-auto mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User Avatar'}
                  className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500 group shadow-xs"
                  title="Click to Upload Photo"
                >
                  <Upload className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[11px] font-bold text-indigo-700">Upload Photo</span>
                </div>
              )}

              {user?.avatar && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
                  title="Change Photo"
                >
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">{user?.role || 'Inventory Manager'}</p>

            {/* Photo Action Buttons */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
              {user?.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={handleDeleteAvatar}
                >
                  Delete Photo
                </Button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Active Member since {user?.joinedDate || '2024'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button variant="danger" size="sm" className="w-full" icon={LogOut} onClick={handleLogout}>
                Sign Out of Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Details View */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Account Information Overview</CardTitle>
              <Button variant="outline" size="sm" icon={Edit} onClick={() => navigate('/profile/edit')}>
                Update Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Full Name
                </p>
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email Address
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" /> Phone Number
                </p>
                <p className="text-sm font-bold text-slate-900">{user?.phone}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" /> Department / Team
                </p>
                <p className="text-sm font-bold text-slate-900">{user?.department}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                <Warehouse className="w-3.5 h-3.5 text-indigo-600" /> Assigned Primary Warehouse
              </p>
              <p className="text-sm font-bold text-slate-900">{user?.assignedWarehouse}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
