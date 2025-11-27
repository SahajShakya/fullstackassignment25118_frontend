import { Button } from '@/components/ui/button';

interface WidgetData {
  domain: string;
  videoUrl: string;
  bannerText: string;
}

interface WidgetDisplayProps {
  widget: WidgetData;
  onChangeWidget?: () => void;
}

export function WidgetDisplay({ widget, onChangeWidget }: WidgetDisplayProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-300 mb-2">
          Domain: <span className="font-mono text-white">{widget.domain}</span>
        </p>
        <p className="text-gray-300">
          {widget.bannerText}
        </p>
      </div>

      {/* Widget Iframe */}
      <div
        className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => window.open(widget.domain, '_blank')}
      >
        <iframe
          width="100%"
          height="100%"
          src={`${widget.videoUrl}${widget.videoUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1`}
          title="Widget Video"
          allowFullScreen
          allow="autoplay"
          style={{ border: 'none' }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg font-semibold">
            Click to visit {widget.domain}
          </span>
        </div>
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
