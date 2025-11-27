import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useUserContext } from '@/hooks/useUserContext';
import { Card } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState, useRef } from 'react';
import { Model } from '@/model/Model';
import { GET_ALL_STORES, STORE_UPDATED } from '@/graphql/queries';
import { GET_WIDGET_BY_ID, TRACK_EVENT } from '@/graphql/widgetQueries';
import type { GetStoresResponse } from '@/types/stores';
import type { GetWidgetByIdResponse } from '@/types/widget';
import { Button } from '@/components/ui/button';
import { ENTER_STORE, EXIT_STORE, UPDATE_MODEL_POSITION } from '@/graphql/queries';
import { WidgetDisplay } from '@/components/WidgetDisplay';

function extractUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

interface EnterStoreResponse {
  enterStore: {
    id: string;
    sessionId: string;
    activeUserCount: number;
  };
}

interface StoreUpdatedResponse {
  storeUpdated: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    activeUserCount: number;
    installedWidgetId?: string;
    installedWidgetDomain?: string;
    models: Array<{
      name: string;
      glbUrl: string;
      position: [number, number];
      size: [number, number, number];
      entranceOrder: number;
    }>;
  };
}

export function StorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useUserContext();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const widgetLoadTrackedRef = useRef(false);
  
  const { data: subscriptionData } = useSubscription<StoreUpdatedResponse>(STORE_UPDATED, {
    variables: { storeId: storeId! },
    skip: !storeId,
  });

  const { data: widgetQueryData } = useQuery<GetWidgetByIdResponse>(GET_WIDGET_BY_ID, {
    variables: { widgetId: subscriptionData?.storeUpdated?.installedWidgetId },
    skip: !subscriptionData?.storeUpdated?.installedWidgetId,
  });

  useQuery<GetStoresResponse>(GET_ALL_STORES, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
    skip: !storeId || !!subscriptionData?.storeUpdated,
  });

  const [enterStore] = useMutation<EnterStoreResponse>(ENTER_STORE, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const [exitStore] = useMutation(EXIT_STORE, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const [updateModelPosition] = useMutation(UPDATE_MODEL_POSITION, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const [trackEvent] = useMutation(TRACK_EVENT);

  useEffect(() => {
    if (widgetQueryData?.getWidgetById && subscriptionData?.storeUpdated && !widgetLoadTrackedRef.current) {
      const widget = widgetQueryData.getWidgetById;
      const store = subscriptionData.storeUpdated;
      
      console.log('[StorePage] Widget loaded, tracking event (first time only)', {
        storeId: store.id,
        domain: widget.domain,
        eventType: 'page_view'
      });
      
      // Mark as tracked
      widgetLoadTrackedRef.current = true;
      
      trackEvent({
        variables: {
          storeId: store.id,
          domain: widget.domain,
          eventType: 'page_view',
          userAgent: navigator.userAgent,
        },
      }).catch((error) => console.error('Error tracking widget load:', error));
    }
  }, [widgetQueryData, subscriptionData, trackEvent]);

  useEffect(() => {
    const handleEnter = async () => {
      try {
        const userIdFromContext = accessToken ? extractUserIdFromToken(accessToken) : null;
        const userId = userIdFromContext
        
        const result = await enterStore({
          variables: { storeId: storeId!, userId },
        });
        
        const backendSessionId = result.data?.enterStore?.sessionId;
        if (backendSessionId) {
          setSessionId(backendSessionId);
          console.log('Successfully entered store with session:', backendSessionId);
        } else {
          console.error('No session ID returned from server');
        }
      } catch (err) {
        console.error('Error entering store:', err);
        setTimeout(() => navigate('/stores'), 2000);
      }
    };

    if (storeId) {
      handleEnter();
    }

    return () => {
      if (storeId && sessionId) {
        exitStore({
          variables: { storeId: storeId, sessionId: sessionId },
        }).catch((err: Error) => console.error('Error exiting store:', err));
      }
    };
  }, [storeId, enterStore, exitStore, navigate, sessionId, accessToken]);

  if (!subscriptionData?.storeUpdated) return <p>Loading store...</p>;
  
  const store = subscriptionData?.storeUpdated;
  if (!store) return <p>Store not found</p>;

  const handleModelDragEnd = async (modelName: string, newPosition: [number, number]) => {
    console.log('Model dropped:', modelName, 'at position:', newPosition);
    try {
      const userIdFromToken = accessToken ? extractUserIdFromToken(accessToken) : null;
      const userId = userIdFromToken || 'anonymous';
      
      const result = await updateModelPosition({
        variables: {
          storeId: storeId,
          modelName: modelName,
          position: newPosition,
          userId,
        },
      });
      console.log('Position update response:', result);
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{store.name}</h1>
          <p className="text-gray-400">{store.description}</p>
          <p className="text-sm text-yellow-400 mt-2">
            Users in store: {store.activeUserCount}/2
          </p>
        </div>
        <Button 
          onClick={() => {
            if (sessionId) {
              exitStore({ variables: { storeId: storeId!, sessionId } });
            }
            navigate('/stores');
          }}
          variant="outline"
          className="text-black border-white hover:bg-white/10"
        >
          Exit Store
        </Button>
      </div>

      {store.models && store.models.length > 0 && (
        <Card className="relative w-full h-[800px] overflow-hidden bg-black">

          <img
            src={store.imageUrl}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />

          <Canvas
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
            }}
            camera={{ 
              position: [0, 2, 8], 
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[5, 10, 7]} intensity={2} castShadow />
            <pointLight position={[-5, 5, 5]} intensity={1.5} />
            <pointLight position={[5, -5, 5]} intensity={1} />
            <hemisphereLight intensity={0.5} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#1a1a1a" transparent opacity={0} />
            </mesh>

            <Suspense fallback={null}>
              {store.models.map((model) => (
                <Model
                  key={`${model.name}-${model.position[0]}-${model.position[1]}`}
                  glbUrl={model.glbUrl}
                  position={model.position}
                  scale={model.size}
                  modelIndex={store.models.indexOf(model)}
                  onDragEnd={(newPos: [number, number]) =>
                    handleModelDragEnd(model.name, newPos)
                  }
                />
              ))}
            </Suspense>
          </Canvas>


        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Install</h2>
        
        {store.installedWidgetId && widgetQueryData?.getWidgetById ? (
          <Card className="p-6 bg-black border-gray-700">
            <WidgetDisplay 
              widget={widgetQueryData.getWidgetById}
              onChangeWidget={() => navigate(`/widgets/${storeId}`)}
            />
          </Card>
        ) : store.installedWidgetId ? (
          <Card className="p-6 bg-black border-gray-700">
            <p className="text-gray-400">Loading</p>
          </Card>
        ) : (
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-300 mb-4">
              Widgets not avaialabe
            </p>
            <Button 
              onClick={() => navigate(`/widgets/${storeId}`)}
              className="bg-white text-black hover:bg-gray-200"
            >
              Browse Widgets
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
