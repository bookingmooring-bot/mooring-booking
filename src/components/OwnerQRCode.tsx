import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface OwnerQRCodeProps {
  ownerId: string;
  ownerName: string;
  mooringName?: string;
  providerSlug?: string | null;
}

const OwnerQRCode = ({ ownerId, ownerName, mooringName, providerSlug }: OwnerQRCodeProps) => {
  const [copied, setCopied] = useState(false);

  const profileUrl = providerSlug
    ? `https://mooring-booking.com/${providerSlug}`
    : `https://mooring-booking.com/owner/${ownerId}`;
  const affiliateUrl = `https://mooring-booking.com/book?ref=${ownerId}`;
  
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };
  
  const handleDownloadQR = () => {
    // Get the SVG element
    const svg = document.getElementById(`qr-${ownerId}`);
    if (!svg) return;
    
    // Create a canvas and draw the SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      
      // White background
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 300, 300);
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `mooring-qr-${ownerId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('QR code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mooringName || ownerName} on Mooring Booking`,
          text: `Book your mooring at ${mooringName || ownerName}!`,
          url: profileUrl
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink(profileUrl);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4 text-center">
        Your Unique QR Code
      </h3>
      
      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <QRCodeSVG 
            id={`qr-${ownerId}`}
            value={profileUrl}
            size={180}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2693.svg",
              height: 30,
              width: 30,
              excavate: true,
            }}
          />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center mb-4">
        Share this QR code to let sailors book your mooring directly
      </p>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadQR}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <Download size={16} />
          <span className="text-xs">Download</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <Share2 size={16} />
          <span className="text-xs">Share</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleCopyLink(profileUrl)}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          <span className="text-xs">Copy</span>
        </Button>
      </div>
      
      {/* Links */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Profile Link</label>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <code className="text-xs text-foreground flex-1 truncate">{profileUrl}</code>
            <button 
              onClick={() => handleCopyLink(profileUrl)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Affiliate Link (Earn 10%)</label>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <code className="text-xs text-foreground flex-1 truncate">{affiliateUrl}</code>
            <button 
              onClick={() => handleCopyLink(affiliateUrl)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Tips */}
      <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
        <h4 className="font-medium text-sm text-foreground mb-2">💡 Marketing Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Print QR code and display at your mooring</li>
          <li>• Share on social media to attract sailors</li>
          <li>• Add to your business cards</li>
          <li>• Earn 10% commission on referrals!</li>
        </ul>
      </div>
    </div>
  );
};

export default OwnerQRCode;
