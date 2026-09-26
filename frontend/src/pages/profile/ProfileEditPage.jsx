import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../schemas';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  User,
  Mail,
  Phone,
  Building,
  Warehouse,
  ArrowLeft,
  Upload,
  Trash2,
  Check
} from 'lucide-react';

export const ProfileEditPage = () => {
  const { user, updateProfile } = useAuthStore();
  const warehouses = useInventoryStore((state) => state.warehouses);
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      assignedWarehouse: user?.assignedWarehouse || (warehouses[0] ? `${warehouses[0].code} (${warehouses[0].name})` : '')
    }
  });

  const onSubmit = (data) => {
    updateProfile(data);
    toast.success('Profile Saved', 'Your user profile details have been updated.');
    navigate('/profile');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        updateProfile({ avatar: base64Url });
        toast.success('Photo Uploaded', 'Profile picture updated successfully.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    updateProfile({ avatar: null });
    toast.info('Photo Removed', 'Profile picture removed.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/profile')}>
        Back to Profile Overview
      </Button>

      <PageHeader
        title="Edit User Profile"
        description="Update your personal details, profile picture, and warehouse assignment."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile Details & Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Photo Upload & Delete Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="relative shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500 group shadow-xs"
                  title="Click to Upload Photo"
                >
                  <Upload className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[10px] font-bold text-indigo-700">Upload Photo</span>
                </div>
              )}

              {user?.avatar && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
                  title="Change Photo"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-slate-900">Profile Photo</h4>
              <p className="text-xs text-slate-500">
                Upload a PNG, JPG or WebP image. Maximum size 5MB.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload New Photo
                </Button>
                {user?.avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={handleDeleteAvatar}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                icon={User}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address *"
                type="email"
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number *"
                icon={Phone}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Department / Team *"
                icon={Building}
                error={errors.department?.message}
                {...register('department')}
              />
            </div>

            {/* Warehouse Dropdown Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-slate-500" /> Assigned Primary Warehouse *
              </label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                {...register('assignedWarehouse')}
              >
                {warehouses.map((wh) => {
                  const warehouseLabel = `${wh.code} (${wh.name})`;
                  return (
                    <option key={wh.id} value={warehouseLabel}>
                      {warehouseLabel}
                    </option>
                  );
                })}
              </select>
              {errors.assignedWarehouse?.message && (
                <p className="text-xs text-rose-500 mt-1">{errors.assignedWarehouse.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" icon={Check} isLoading={isSubmitting}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

