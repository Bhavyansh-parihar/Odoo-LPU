import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema } from '../../schemas';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Boxes, ShieldCheck, ArrowLeft } from 'lucide-react';

export const VerifyOtpPage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const onSubmit = async (data) => {
    try {
      await authService.verifyOtp(data.otp);
      toast.success('Verification Successful', 'You can now reset your password.');
      navigate('/login');
    } catch (err) {
      toast.error('Invalid OTP', 'The verification code entered is invalid or expired.');
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
          <p className="text-xs text-slate-400 mt-1">Security Verification Code</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-white">
          <CardHeader>
            <div>
              <CardTitle>Verify OTP Code</CardTitle>
              <CardDescription>Enter the 6-digit verification code sent to your email</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="6-Digit Security Code"
                icon={ShieldCheck}
                placeholder="123456"
                maxLength={6}
                className="tracking-widest text-center font-bold text-lg"
                error={errors.otp?.message}
                {...register('otp')}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Verify Code & Reset
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:underline">
                Resend OTP
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
