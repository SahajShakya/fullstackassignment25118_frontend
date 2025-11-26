import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useUserContext } from '@/hooks/useUserContext';
import { Card } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { Model } from '@/model/Model';
import { GET_ALL_STORES, STORE_UPDATED } from '@/graphql/queries';
import type { GetStoresResponse } from '@/types/stores';
import { Button } from '@/components/ui/button';
import { ENTER_STORE, EXIT_STORE, UPDATE_MODEL_POSITION } from '@/graphql/queries';

// Helper function to decode JWT and extract user_id
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
  const [storeFullError, setStoreFullError] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Use subscription for real-time updates instead of polling
  const { data: subscriptionData, loading, error } = useSubscription<StoreUpdatedResponse>(STORE_UPDATED, {
    variables: { storeId: storeId! },
    skip: !storeId,
  });

  // Fallback to query if subscription doesn't work
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

  // Call enterStore on mount
  useEffect(() => {
    const handleEnter = async () => {
      try {
        // Get user_id from context
        const userIdFromContext = accessToken ? extractUserIdFromToken(accessToken) : null;
        const userId = userIdFromContext || 'anonymous';
        
        const result = await enterStore({
          variables: { storeId: storeId!, userId },
        });
        
        // Get the session ID returned from the backend mutation
        const backendSessionId = result.data?.enterStore?.sessionId;
        if (backendSessionId) {
          setSessionId(backendSessionId);
          console.log('Successfully entered store with session:', backendSessionId);
        } else {
          console.error('No session ID returned from server');
        }
      } catch (err) {
        console.error('Error entering store:', err);
        setStoreFullError(true);
        // Redirect after 2 seconds
        setTimeout(() => navigate('/stores'), 2000);
      }
    };

    if (storeId) {
      handleEnter();
    }

    // Call exitStore on unmount
    return () => {
      if (storeId && sessionId) {
        exitStore({
          variables: { storeId: storeId, sessionId: sessionId },
        }).catch((err) => console.error('Error exiting store:', err));
      }
    };
  }, [storeId, enterStore, exitStore, navigate, sessionId, accessToken]);

  if (loading) return <p>Loading store...</p>;
  if (error) return <p>Error loading store</p>;
  
  const store = subscriptionData?.storeUpdated;
  if (!store) return <p>Store not found</p>;
  if (storeFullError) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <Card className="bg-red-900 text-white p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Store Full</h2>
          <p className="mb-4">This store already has 2 users. Please try again later.</p>
          <p className="text-sm text-gray-300">Redirecting...</p>
        </Card>
      </div>
    );
  }

  const handleModelDragEnd = async (modelName: string, newPosition: [number, number]) => {
    console.log('Model dropped:', modelName, 'at position:', newPosition);
    try {
      // Get user_id from token
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
            👥 Users in store: {store.activeUserCount}/2
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
          {/* Store Image Background */}
          <img
            src={store.imageUrl}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />

          {/* 3D Interactive Canvas */}
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
            {/* Enhanced Lighting for interaction */}
            <ambientLight intensity={1} />
            <directionalLight position={[5, 10, 7]} intensity={2} castShadow />
            <pointLight position={[-5, 5, 5]} intensity={1.5} />
            <pointLight position={[5, -5, 5]} intensity={1} />
            <hemisphereLight intensity={0.5} />

            {/* Ground plane - transparent for reference */}
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
                  modelIndex={store.models.indexOf(model)}
                  onDragEnd={(newPos: [number, number]) =>
                    handleModelDragEnd(model.name, newPos)
                  }
                />
              ))}
            </Suspense>
          </Canvas>

          {/* Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg">
            <p className="text-sm">
              👉 Drag models to reposition | 🖱️ Right-click to rotate | 🔍 Scroll to zoom
            </p>
            <p className="text-xs text-yellow-400 mt-2">
              {store.activeUserCount > 1 ? '🔄 Other user(s) present - changes sync in real-time' : '👤 You are alone in this store'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
