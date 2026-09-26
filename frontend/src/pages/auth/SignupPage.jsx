import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../schemas';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Boxes, User, Mail, Lock } from 'lucide-react';

export const SignupPage = () => {
  const signup = useAuthStore((state) => state.signup);
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await signup(data.fullName, data.email);
      toast.success('Account Created!', 'Welcome to StockSense ERP.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Registration Failed', 'Could not complete account setup.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl mb-3">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">StockSense ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Create your Inventory Manager Account</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-white">
          <CardHeader>
            <div>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Enter your professional details to get started</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                icon={User}
                placeholder="e.g. Alex Morgan"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="alex.morgan@company.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Create StockSense Account
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
