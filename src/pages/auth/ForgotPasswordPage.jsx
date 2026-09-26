import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../../schemas';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Boxes, Mail, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('Reset Code Sent', 'Check your email inbox for the 6-digit OTP code.');
      navigate('/verify-otp');
    } catch (err) {
      toast.error('Error', 'Unable to send password reset email.');
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
          <p className="text-xs text-slate-400 mt-1">Password Recovery Portal</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-white">
          <CardHeader>
            <div>
              <CardTitle>Forgot Password?</CardTitle>
              <CardDescription>Enter your email to receive an OTP verification code</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                icon={Mail}
                placeholder="alex.morgan@stocksense.io"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Send OTP Verification Code
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
