import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@apollo/client/react";
import { useUserContext } from '@/hooks/useUserContext';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Model } from '@/model/Model';
import { GET_ALL_STORES } from '@/graphql/queries';
import type { Store, GetStoresResponse } from '@/types/stores';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StoresPage() {
  const navigate = useNavigate();
  const { accessToken } = useUserContext();
  const { data, loading, error } = useQuery<GetStoresResponse>(GET_ALL_STORES, {
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  console.log(data)

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const selectedStore = data?.getAllStores?.find((s) => s.id === selectedStoreId) 
    || data?.getAllStores?.[0] 
    || null;

  if (loading) return <p>Loading stores...</p>;
  if (error) return <p>Error loading stores</p>;

  const handleStoreChange = (storeId: string) => {
    console.log(`✓ User entered store: ${storeId}`);
    setSelectedStoreId(storeId);
  };

  const handleModelDragEnd = (modelName: string, newPosition: [number, number]) => {
    // Call your updateModelPosition mutation here
    console.log('New position:', modelName, newPosition);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="p-6 mb-4">
        <h1 className="text-3xl font-bold mb-4">Store Selection</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select a Store
            </label>
            {data?.getAllStores && data.getAllStores.length > 0 && (
              <Select value={selectedStore?.id || ''} onValueChange={handleStoreChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a store..." />
                </SelectTrigger>
                <SelectContent>
                  {data.getAllStores.map((store: Store) => (
                    <SelectItem key={store.id} value={store.id}>
                      <div className="flex items-center gap-2">
                        <span>{store.name}</span>
                        <span className="text-xs text-gray-500">
                          ({store.activeUserCount}/2 users)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedStore && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedStore.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Selected store
                </p>
              </div>
              <Separator />
              <div className="flex h-5 items-center space-x-4 text-sm">
                <Separator orientation="vertical" />
                <span className="text-xs font-medium text-gray-900">
                  {selectedStore.activeUserCount}/2 users
                </span>
              </div>
              <Button
                onClick={() => navigate(`/store/${selectedStore.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                Enter Store
              </Button>
            </div>
          )}
        </div>
      </Card>

      {selectedStore && (
        <Card className="relative w-full h-[600px] overflow-hidden bg-black">
          {/* Store Image Background */}
          <img
            src={selectedStore.imageUrl}
            alt={selectedStore.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 3D Models Canvas Overlay */}
          {selectedStore.models && selectedStore.models.length > 0 && (
            <Canvas
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
              }}
              camera={{ 
                position: [0, 1, 5], 
                fov: 80,
                near: 0.1,
                far: 1000
              }}
              dpr={[1, 2]}
            >
              {/* Lighting - key for model visibility */}
              <ambientLight intensity={2} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
              <pointLight position={[-5, -5, 5]} intensity={1} />
              <hemisphereLight intensity={1} />

              <Suspense fallback={null}>
                {selectedStore.models.map((model, index) => {
                  console.log(`Rendering model ${index}:`, model.name, model.position, model.entranceOrder);
                  return (
                    <Model
                      key={model.name}
                      glbUrl={model.glbUrl}
                      position={model.position}
                      scale={model.size}
                      entranceOrder={model.entranceOrder}
                      modelIndex={index}
                      onDragEnd={(newPos: [number, number]) =>
                        handleModelDragEnd(model.name, newPos)
                      }
                    />
                  );
                })}
              </Suspense>
            </Canvas>
          )}
        </Card>
      )}
    </div>
  );
}
