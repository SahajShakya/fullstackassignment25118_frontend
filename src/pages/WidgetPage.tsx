import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnalyticsMetricCard } from '@/components/AnalyticsMetricCard';
import { GET_ANALYTICS_SUMMARY, GET_ALL_WIDGETS } from '@/graphql/widgetQueries';
import { CREATE_WIDGET, UPDATE_WIDGET, DELETE_WIDGET } from '@/graphql/widgetMutations';
import { GET_ALL_STORES } from '@/graphql/queries';
import type { GetAllWidgetsResponse, GetAnalyticsSummaryResponse, CreateWidgetResponse, WidgetConfig } from '@/types/widget';
import type { GetStoresResponse } from '@/types/stores';

interface CreateWidgetInput {
  domain: string;
  videoUrl: string;
  bannerText: string;
}

export function WidgetPage() {
  const navigate = useNavigate();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWidgetStoreId, setEditingWidgetStoreId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateWidgetInput>({
    domain: '',
    videoUrl: '',
    bannerText: '',
  });

  const { data: storesData } = useQuery<GetStoresResponse>(GET_ALL_STORES);


  const stores = storesData?.getAllStores || [];
  if (stores.length > 0 && !selectedStoreId) {
    setSelectedStoreId(stores[0].id);
  }


  const { data: widgetsData, refetch } = useQuery<GetAllWidgetsResponse>(
    GET_ALL_WIDGETS
  );

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery<GetAnalyticsSummaryResponse>(
    GET_ANALYTICS_SUMMARY,
    {
      variables: { storeId: selectedStoreId! },
      skip: !selectedStoreId,
    }
  );


  const [createWidget, { loading: createLoading }] = useMutation<CreateWidgetResponse>(CREATE_WIDGET);

  const [updateWidget] = useMutation(UPDATE_WIDGET);

  const [deleteWidget] = useMutation(DELETE_WIDGET);

  const widgets = widgetsData?.getAllWidgets || [];
  const analytics = analyticsData?.getAnalyticsSummary;

  console.log('widgetsData:', widgetsData);
  console.log('analyticsData:', analyticsData);


  useEffect(() => {
    if (selectedStoreId) {
      refetchAnalytics();
    }
  }, [selectedStoreId, refetchAnalytics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.domain || !formData.videoUrl) {
      setError('No data field');
      return;
    }

    try {
      if (editingId) {
        // Update existing widget
        await updateWidget({
          variables: {
            widgetId: editingId,
            videoUrl: formData.videoUrl,
            bannerText: formData.bannerText,
            storeId: editingWidgetStoreId,
          },
        });
        setEditingId(null);
        setEditingWidgetStoreId(null);
      } else {
        await createWidget({
          variables: {
            storeId: selectedStoreId!,
            domain: formData.domain,
            videoUrl: formData.videoUrl,
            bannerText: formData.bannerText,
          },
        });
      }
      
      setFormData({ domain: '', videoUrl: '', bannerText: '' });
      setShowForm(false);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save widget');
    }
  };

  const handleEdit = (widget: WidgetConfig) => {
    setFormData({
      domain: widget.domain,
      videoUrl: widget.videoUrl,
      bannerText: widget.bannerText,
    });
    setEditingId(widget.id);
    setEditingWidgetStoreId(widget.storeId);
    setShowForm(true);
  };

  const handleDelete = async (widgetId: string) => {
    if (!confirm('Delete?')) return;
    
    try {
      await deleteWidget({
        variables: { widgetId },
      });
      refetch();
    } catch (err) {
      console.error('Error while deleting:', err);
      setError('Failed to delete widget');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingWidgetStoreId(null);
    setFormData({ domain: '', videoUrl: '', bannerText: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Widgets</h1>
          <div className="flex items-center gap-4 mb-4">
            <Label>Store:</Label>
            <select 
              value={selectedStoreId || ''} 
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Select a store...</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => navigate('/stores')}>
            Back
          </Button>
        </div>

        {analytics && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <AnalyticsMetricCard label="Page Views" value={analytics.pageView} />
            <AnalyticsMetricCard label="Videos Loaded" value={analytics.videoLoaded} />
            <AnalyticsMetricCard label="Links Clicked" value={analytics.linkClicked} />
          </div>
        )}

        {showForm ? (
          <Card className="p-6 mb-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Widget' : 'Create Widget'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <Label>Domain name</Label>
                  <Input
                    placeholder="Domain.com"
                    value={formData.domain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, domain: e.target.value })}
                    disabled={!!editingId}
                  />
                </div>
              )}
              {editingId && (
                <div>
                  <Label>Store</Label>
                  <select 
                    value={editingWidgetStoreId || ''} 
                    onChange={(e) => setEditingWidgetStoreId(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Select a store...</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label>Video url</Label>
                <Input
                  placeholder="URL"
                  value={formData.videoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
              <div>
                <Label>Banner</Label>
                <Input
                  placeholder="banner"
                  value={formData.bannerText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bannerText: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createLoading}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)} className="mb-8">
            New Widget
          </Button>
        )}

        <div className="space-y-4">
          {
            widgets.map((widget) => (
              <Card key={widget.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-semibold">{widget.domain}</p>
                    <p className="text-sm text-muted-foreground">{widget.videoUrl}</p>
                    <p className="text-xs text-muted-foreground mt-1">{widget.bannerText}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(widget)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(widget.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  );
}
