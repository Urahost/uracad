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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SyncSystem } from "@/types/api";

const syncConfigSchema = z.object({
  system: z.enum(['esx', 'qbcore'] as const),
  syncInterval: z.number().min(60000),
  apiUrl: z.string().url(),
});

type SyncConfigFormValues = z.infer<typeof syncConfigSchema>;

type SyncConfigFormProps = {
  organizationId: string;
  defaultValues?: {
    apiUrl?: string;
    syncInterval?: number;
    lastSyncAt?: string | Date;
    metadata?: string;
  };
};

export function SyncConfigForm({ organizationId, defaultValues }: SyncConfigFormProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(
    defaultValues?.lastSyncAt ? new Date(defaultValues.lastSyncAt) : null
  );

  const form = useForm<SyncConfigFormValues>({
    resolver: zodResolver(syncConfigSchema),
    defaultValues: {
      system: defaultValues?.metadata ? JSON.parse(defaultValues.metadata).syncSystem ?? 'esx' : 'esx',
      syncInterval: defaultValues?.syncInterval ?? 60000,
      apiUrl: defaultValues?.apiUrl ?? '',
    },
  });

  const system = form.watch('system');

  // Réinitialiser le formulaire quand les defaultValues changent
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        system: defaultValues.metadata ? JSON.parse(defaultValues.metadata).syncSystem ?? 'esx' : 'esx',
        syncInterval: defaultValues.syncInterval ?? 60000,
        apiUrl: defaultValues.apiUrl ?? '',
      });
    }
  }, [defaultValues, form]);

  const onSubmit = async (values: SyncConfigFormValues) => {
    try {
      setIsSaving(true);
      const toastId = toast.loading('Saving configuration...');

      logger.info('Saving sync config:', { values, organizationId });

      const response = await fetch(`/api/organizations/${organizationId}/sync-config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Failed to save configuration:', { 
          status: response.status, 
          statusText: response.statusText,
          data 
        });
        throw new Error(data.message ?? 'Failed to save configuration');
      }

      logger.info('Configuration saved successfully:', data);
      toast.success('Configuration saved successfully', { id: toastId });
      
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      logger.error('Error saving configuration:', error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const startSync = async () => {
    try {
      setIsSyncing(true);
      const toastId = toast.loading('Starting synchronization...');

      logger.info('Starting sync for organization:', organizationId);

      const response = await fetch(`/api/organizations/${organizationId}/sync`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Sync failed:', { 
          status: response.status, 
          statusText: response.statusText,
          data 
        });
        throw new Error(data.message ?? 'Sync failed');
      }

      logger.info('Sync completed successfully:', data);
      setLastSyncAt(new Date());
      toast.success('Synchronization completed successfully', { id: toastId });
      
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Synchronization failed';
      logger.error('Sync error:', error);
      toast.error(errorMessage);
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
            name="system"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sync System</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sync system" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="esx">ESX</SelectItem>
                    <SelectItem value="qbcore">QBCore</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the system you want to sync with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Base URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`https://your-${system}-server.com`}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The base URL of your {system.toUpperCase()} server API
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