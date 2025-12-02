import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GET_ALL_WIDGETS } from '@/graphql/widgetQueries';
import { INSTALL_WIDGET, GET_ALL_STORES } from '@/graphql/queries';
import type { GetAllWidgetsResponse, WidgetConfig } from '@/types/widget';
import type { GetStoresResponse } from '@/types/stores';

export function WidgetsListPage() {
  const navigate = useNavigate();
  const { storeId: storeIdFromParams } = useParams<{ storeId: string }>();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(storeIdFromParams || null);
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const { data: storesData } = useQuery<GetStoresResponse>(GET_ALL_STORES);

  const { data: widgetsData, loading } = useQuery<GetAllWidgetsResponse>(
    GET_ALL_WIDGETS
  );

  const [installWidget] = useMutation(INSTALL_WIDGET);

  const stores = storesData?.getAllStores || [];
  const widgets = widgetsData?.getAllWidgets || [];

  // Set first store as default
  if (stores.length > 0 && !selectedStoreId) {
    setSelectedStoreId(stores[0].id);
  }

  const handleInstall = async (widget: WidgetConfig) => {
    if (!selectedStoreId) {
      setError('Please select a store first');
      return;
    }

    setError('');
    setSuccess('');
    setInstallingId(widget.id);
    
    try {
      await installWidget({
        variables: {
          storeId: selectedStoreId,
          widgetId: widget.id,
        },
      });
      
      setSuccess(`Widget "${widget.domain}" installed successfully!`);
      setTimeout(() => {
        navigate(`/store/${selectedStoreId}`);
      }, 1500);
    } catch (err) {
      console.error('Error installing widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to install widget');
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Available Widgets</h1>
          <p className="text-muted-foreground mb-4">Choose a widget to install on your store</p>
          
          {/* Store Selector - only show if storeId not in URL */}
          {!storeIdFromParams && (
            <div className="flex items-center gap-4 mb-4">
              <label className="font-semibold">Select Store:</label>
              <select 
                value={selectedStoreId || ''} 
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Choose a store...</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Back Button - only show if came from store */}
          {storeIdFromParams && (
            <Button variant="outline" onClick={() => navigate(`/store/${storeIdFromParams}`)}>
              Back to Store
            </Button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading widgets...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && widgets.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No widgets available yet</p>
            <Button onClick={() => navigate('/widget')}>
              Install Widgets
            </Button>
          </Card>
        )}

        {/* Widgets Grid */}
        {!loading && widgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <Card key={widget.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                {/* Video Preview */}
                <div className="bg-muted h-32 overflow-hidden">
                  <video
                    src={widget.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="font-semibold text-sm mb-1">Domain</p>
                  <p className="text-sm text-muted-foreground mb-3">{widget.domain}</p>

                  {widget.bannerText && (
                    <>
                      <p className="font-semibold text-sm mb-1">Banner Text</p>
                      <p className="text-sm text-muted-foreground mb-3">{widget.bannerText}</p>
                    </>
                  )}

                  <div className="mt-auto">
                    <Button
                      onClick={() => handleInstall(widget)}
                      disabled={installingId === widget.id}
                      className="w-full"
                    >
                      {installingId === widget.id ? 'Installing...' : 'Install Widget'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
