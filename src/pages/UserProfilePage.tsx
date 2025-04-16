
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';
import { Chip } from '@/components/ui/chip';

const UserProfilePage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoadingProfile(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        } catch (err: any) {
          console.error('Error fetching profile:', err);
          setError(err.message);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (isLoading || loadingProfile) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Chip className="bg-primary/10 text-primary border-none">{t('account')}</Chip>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('userProfileTitle')}</h1>
          <p className="text-muted-foreground">{t('userProfileDescription')}</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
            <TabsTrigger value="password">{t('password')}</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="profile" className="space-y-4">
              {profile && <ProfileEditForm profile={profile} setProfile={setProfile} />}
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4">
              <PasswordChangeForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default UserProfilePage;
