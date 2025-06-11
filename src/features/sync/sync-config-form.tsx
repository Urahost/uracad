'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

const syncConfigSchema = z.object({
  apiUrl: z.string().url('Please enter a valid URL'),
  syncInterval: z.number().min(60000, 'Minimum interval is 1 minute').optional(),
});

type SyncConfigFormValues = z.infer<typeof syncConfigSchema>;

type SyncConfigFormProps = {
  organizationId: string;
  defaultValues?: Partial<SyncConfigFormValues>;
}

export function SyncConfigForm({ organizationId, defaultValues }: SyncConfigFormProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const form = useForm<SyncConfigFormValues>({
    resolver: zodResolver(syncConfigSchema),
    defaultValues: {
      apiUrl: defaultValues?.apiUrl ?? '',
      syncInterval: defaultValues?.syncInterval ?? 300000, // 5 minutes par défaut
    },
  });

  // Réinitialiser le formulaire quand les defaultValues changent
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        apiUrl: defaultValues.apiUrl ?? '',
        syncInterval: defaultValues.syncInterval ?? 300000,
      });
    }
  }, [defaultValues, form]);

  const onSubmit = async (values: SyncConfigFormValues) => {
    try {
      setIsSaving(true);
      const toastId = toast.loading('Saving configuration...');

      const response = await fetch(`/api/organizations/${organizationId}/sync-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const data = await response.json();
      toast.success('Configuration saved successfully', { id: toastId });
      
      // Forcer le rechargement des données
      router.refresh();
    } catch (error) {
      toast.error('Failed to save configuration');
      logger.error('Error saving configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startSync = async () => {
    try {
      setIsSyncing(true);
      const toastId = toast.loading('Starting synchronization...');

      const response = await fetch(`/api/organizations/${organizationId}/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      setLastSyncAt(new Date());
      toast.success('Synchronization completed successfully', { id: toastId });
      
      // Forcer le rechargement des données
      router.refresh();
    } catch (error) {
      toast.error('Synchronization failed');
      logger.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const isSubmitting = isSyncing || isSaving;

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Synchronization</CardTitle>
        <CardDescription>
          Configure the API endpoint and synchronization settings for your server.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="apiUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://your-api.com"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The base URL of your server's API endpoint.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="syncInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sync Interval (ms)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  How often to sync data (in milliseconds). Minimum: 60000 (1 minute).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {lastSyncAt && (
                <p>
                  Last sync: {lastSyncAt.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={startSync}
                disabled={isSubmitting}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button 
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 