import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../schemas';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Phone, Building, Warehouse, LogOut, ShieldCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Alex Morgan',
      email: user?.email || 'alex.morgan@stocksense.io',
      phone: user?.phone || '+1 (555) 234-5678',
      department: user?.department || 'Supply Chain & Warehousing',
      assignedWarehouse: user?.assignedWarehouse || 'WH-MAIN (Main Logistics Warehouse)'
    }
  });

  const onSubmit = (data) => {
    updateProfile(data);
    toast.success('Profile Saved', 'Your user profile details have been updated.');
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
        description="Manage your account preferences, contact info, and assigned warehouse site."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-indigo-50 shadow-md mb-4"
            />
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">{user?.role}</p>

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
                <span>Active Member since {user?.joinedDate}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button variant="danger" size="sm" className="w-full" icon={LogOut} onClick={handleLogout}>
                Sign Out of Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Input
                label="Assigned Primary Warehouse *"
                icon={Warehouse}
                error={errors.assignedWarehouse?.message}
                {...register('assignedWarehouse')}
              />

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button type="submit">
                  Update Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
