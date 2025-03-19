
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegisterFormProps {
  onRegisterSuccess?: (email: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  // Registration form schema with translations
  const registerSchema = z.object({
    email: z.string().email({ message: t('invalidEmail') }),
    password: z.string().min(6, { message: t('passwordLength') }),
    username: z.string().min(3, { message: t('usernameLength') }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
          },
        },
      });

      if (error) {
        throw error;
      }

      const successMessage = {
        en: 'Account created successfully. Please check your email.',
        ru: 'Учетная запись успешно создана. Пожалуйста, проверьте свою электронную почту.',
        uz: 'Hisob muvaffaqiyatli yaratildi. Iltimos, elektron pochtangizni tekshiring.',
        ko: '계정이 생성되었습니다. 이메일을 확인해주세요.'
      };

      toast({
        title: language === 'ko' ? '회원가입 성공' : 
               language === 'ru' ? 'Регистрация прошла успешно' :
               language === 'uz' ? 'Ro\'yxatdan o\'tish muvaffaqiyatli' : 
               'Registration successful',
        description: successMessage[language],
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(values.email);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      const userAlreadyRegisteredMsg = {
        en: 'This email is already registered.',
        ru: 'Этот адрес электронной почты уже зарегистрирован.',
        uz: 'Bu elektron pochta allaqachon ro\'yxatdan o\'tgan.',
        ko: '이미 등록된 이메일 주소입니다.'
      };
      
      setError(
        error.message === 'User already registered'
          ? userAlreadyRegisteredMsg[language]
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('email')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('username')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('username')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('password')}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full mt-6" type="submit" disabled={isLoading}>
            {isLoading ? t('registering') : t('register')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
