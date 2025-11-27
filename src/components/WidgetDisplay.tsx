import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { TRACK_EVENT } from '@/graphql/widgetQueries';

interface WidgetData {
  id: string;
  domain: string;
  videoUrl: string;
  bannerText: string;
  storeId: string;
}

interface WidgetDisplayProps {
  widget: WidgetData;
  onChangeWidget?: () => void;
}

export function WidgetDisplay({ widget, onChangeWidget }: WidgetDisplayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [trackEvent] = useMutation(TRACK_EVENT);

  const handleDomainClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('[WidgetDisplay] Domain link clicked, tracking link_clicked event', {
        storeId: widget.storeId,
        domain: widget.domain,
        eventType: 'link_clicked'
      });
      
      // Track the link click event
      const result = await trackEvent({
        variables: {
          storeId: widget.storeId,
          domain: widget.domain,
          eventType: 'link_clicked',
          userAgent: navigator.userAgent,
        },
      });
      
      console.log('[WidgetDisplay] Link click tracked', result.data);
      
      // Open domain in new tab
      window.open(`https://${widget.domain}`, '_blank');
    } catch (error) {
      console.error('Error tracking link click:', error);
      // Still open link even if tracking fails
      window.open(`https://${widget.domain}`, '_blank');
    }
  };

  const handleVideoClick = async () => {
    try {
      console.log('[WidgetDisplay] Video clicked, tracking video_loaded event', {
        storeId: widget.storeId,
        domain: widget.domain,
        eventType: 'video_loaded'
      });
      
      // Track the video play event
      const result = await trackEvent({
        variables: {
          storeId: widget.storeId,
          domain: widget.domain,
          eventType: 'video_loaded',
          userAgent: navigator.userAgent,
        },
      });
      
      console.log('[WidgetDisplay] Video play tracked', result.data);
      
      // Hide the overlay after click
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
      }
    } catch (error) {
      console.error('Error tracking video click:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-300 mb-2">
          Domain:{' '}
          <button
            onClick={handleDomainClick}
            className="font-mono text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
          >
            {widget.domain}
          </button>
        </p>
        <p className="text-gray-300">
          {widget.bannerText}
        </p>
      </div>

      {/* Video Container */}
      <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden group">
        <iframe
          width="100%"
          height="100%"
          src={`${widget.videoUrl}${widget.videoUrl.includes('?') ? '&' : '?'}autoplay=1`}
          title="Widget Video"
          allowFullScreen
          allow="autoplay"
          style={{ border: 'none' }}
        />
        {/* Click overlay to track plays */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors cursor-pointer"
          onClick={handleVideoClick}
          style={{ pointerEvents: 'auto' }}
        />
      </div>

      {onChangeWidget && (
        <Button
          variant="outline"
          className="text-black border-white hover:bg-white/10"
          onClick={onChangeWidget}
        >
          Change Widget
        </Button>
      )}
    </div>
  );
}
