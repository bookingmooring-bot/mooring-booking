import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { type MooringLayer, getLayerBadge } from '@/lib/mooringLayer';

export default memo(function MooringLayerBadge({ layer }: { layer: MooringLayer }) {
  const { label, color, bgColor } = getLayerBadge(layer);
  return (
    <Badge className={`${bgColor} ${color} border-transparent`}>
      {label}
    </Badge>
  );
});
