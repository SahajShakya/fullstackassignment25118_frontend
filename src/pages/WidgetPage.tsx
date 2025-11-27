import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GET_WIDGETS_BY_STORE, GET_ANALYTICS_SUMMARY } from '@/graphql/widgetQueries';
import { CREATE_WIDGET, UPDATE_WIDGET, DELETE_WIDGET } from '@/graphql/widgetMutations';
import { useUserContext } from '@/hooks/useUserContext';
import type { GetWidgetsByStoreResponse, GetAnalyticsSummaryResponse, CreateWidgetResponse, WidgetConfig } from '@/types/widget';

interface CreateWidgetInput {
  domain: string;
  videoUrl: string;
  bannerText: string;
}

export function WidgetPage() {
  const navigate = useNavigate();
  const { accessToken } = useUserContext();
  const storeId = 'default'; // Using a fixed store ID for now
  
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateWidgetInput>({
    domain: '',
    videoUrl: '',
    bannerText: '',
  });

  // Queries
  const { data: widgetsData, loading, refetch } = useQuery<GetWidgetsByStoreResponse>(
    GET_WIDGETS_BY_STORE,
    {
      variables: { storeId },
      context: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { data: analyticsData } = useQuery<GetAnalyticsSummaryResponse>(
    GET_ANALYTICS_SUMMARY,
    {
      variables: { storeId },
      context: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  // Mutations
  const [createWidget, { loading: createLoading }] = useMutation<CreateWidgetResponse>(CREATE_WIDGET, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const [updateWidget] = useMutation(UPDATE_WIDGET, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const [deleteWidget] = useMutation(DELETE_WIDGET, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const widgets = widgetsData?.getWidgetsByStore || [];
  const analytics = analyticsData?.getAnalyticsSummary;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.domain || !formData.videoUrl) {
      setError('Please fill in all required fields');
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
          },
        });
        setEditingId(null);
      } else {
        // Create new widget
        await createWidget({
          variables: {
            storeId,
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
    setShowForm(true);
  };

  const handleDelete = async (widgetId: string) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;
    
    try {
      await deleteWidget({
        variables: { widgetId },
      });
      refetch();
    } catch (err) {
      console.error('Error deleting widget:', err);
      setError('Failed to delete widget');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ domain: '', videoUrl: '', bannerText: '' });
    setError('');
  };

  // const copyCode = () => {
  //   navigator.clipboard.writeText(
  //     `<script src="http://localhost:8000/widget/index.js" data-store-id="${storeId}"></script>`
  //   );
  // };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Widgets</h1>
          <Button variant="outline" onClick={() => navigate('/stores')}>
            Back
          </Button>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold">{analytics.pageView}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Videos Loaded</p>
              <p className="text-2xl font-bold">{analytics.videoLoaded}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Links Clicked</p>
              <p className="text-2xl font-bold">{analytics.linkClicked}</p>
            </Card>
          </div>
        )}

        {/* Embed Code
        <Card className="p-6 mb-8">
          <div className="block mb-2 font-medium">Embed Code</div>
          <div className="flex gap-2">
            <code className="flex-1 bg-muted p-3 rounded text-sm break-all">
              &lt;script src="http://localhost:8000/widget/index.js" data-store-id="{storeId}"&gt;&lt;/script&gt;
            </code>
            <Button onClick={copyCode}>Copy</Button>
          </div>
        </Card> */}

        {showForm ? (
          <Card className="p-6 mb-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Widget' : 'Create Widget'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <Label>Domain</Label>
                  <Input
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, domain: e.target.value })}
                    disabled={!!editingId}
                  />
                </div>
              )}
              <div>
                <Label>Video URL</Label>
                <Input
                  placeholder="http://..."
                  value={formData.videoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
              <div>
                <Label>Banner Text</Label>
                <Input
                  placeholder="Text..."
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

        {/* Widgets List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : widgets.length === 0 ? (
            <p className="text-muted-foreground">No widgets yet</p>
          ) : (
            widgets.map((widget) => (
              <Card key={widget.id} className="p-4">
                <div className="flex justify-between items-start">
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
          )}
        </div>
      </div>
    </div>
  );
}
