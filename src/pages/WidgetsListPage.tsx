import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GET_WIDGETS_BY_STORE } from '@/graphql/widgetQueries';
import { INSTALL_WIDGET } from '@/graphql/queries';
import { useUserContext } from '@/hooks/useUserContext';
import type { GetWidgetsByStoreResponse, WidgetConfig } from '@/types/widget';

export function WidgetsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useUserContext();
  const storeId = 'default';
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const { data: widgetsData, loading } = useQuery<GetWidgetsByStoreResponse>(
    GET_WIDGETS_BY_STORE,
    {
      variables: { storeId },
      context: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const [installWidget] = useMutation(INSTALL_WIDGET, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const widgets = widgetsData?.getWidgetsByStore || [];

  const handleInstall = async (widget: WidgetConfig) => {
    setError('');
    setSuccess('');
    setInstallingId(widget.id);
    
    try {
      await installWidget({
        variables: {
          storeId,
          widgetId: widget.id,
        },
      });
      
      setSuccess(`Widget "${widget.domain}" installed successfully!`);
      setTimeout(() => {
        navigate('/store/default');
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
          <h1 className="text-3xl font-bold mb-2">Available Widgets</h1>
          <p className="text-muted-foreground">Choose a widget to install on your store</p>
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
            <p className="text-muted-foreground">No widgets available yet</p>
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
