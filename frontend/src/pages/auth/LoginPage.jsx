import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Boxes, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex@stocksense.io',
      password: 'password123'
    }
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        toast.success('Welcome back!', 'Successfully signed in to StockSense ERP.');
        navigate('/dashboard');
      } else {
        toast.error('Authentication Failed', res.error || 'Invalid credentials provided.');
      }
    } catch (err) {
      toast.error('Authentication Failed', 'An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl mb-3">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">StockSense ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Smart Inventory & Stock Operations Management</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-white">
          <CardHeader>
            <div>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>Enter your email and password to access the dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="alex.morgan@stocksense.io"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Sign In to StockSense
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
