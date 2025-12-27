import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, DollarSign, AlertCircle, TrendingDown } from 'lucide-react';
import { HotelRoomPricing, VehiclePricing } from '@/types';

const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' }
];

interface PricingConfigurationProps {
  pricing?: HotelRoomPricing | VehiclePricing | null;
  priceLabel: string; // "per night" or "per day"
  onChange: (pricing: Partial<HotelRoomPricing | VehiclePricing>) => void;
}

export const PricingConfiguration: React.FC<PricingConfigurationProps> = ({
  pricing,
  priceLabel,
  onChange
}) => {
  const [formData, setFormData] = useState({
    off_season_months: pricing?.off_season_months || [],
    off_season_price: pricing?.off_season_price?.toString() || '',
    on_season_months: pricing?.on_season_months || [],
    on_season_price: pricing?.on_season_price?.toString() || '',
    closed_months: pricing?.closed_months || [],
    last_minute_enabled: pricing?.last_minute_enabled || false,
    last_minute_days_before: pricing?.last_minute_days_before?.toString() || '1',
    last_minute_discount_price: pricing?.last_minute_discount_price?.toString() || ''
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Validate month selections
  const validateMonths = (
    offSeason: number[],
    onSeason: number[],
    closed: number[]
  ): string[] => {
    const errors: string[] = [];
    
    // Check for overlaps
    const offClosedOverlap = offSeason.filter(m => closed.includes(m));
    const onClosedOverlap = onSeason.filter(m => closed.includes(m));
    const offOnOverlap = offSeason.filter(m => onSeason.includes(m));
    
    if (offClosedOverlap.length > 0) {
      errors.push(`Off-season cannot overlap with closed months: ${offClosedOverlap.map(m => MONTHS[m-1].short).join(', ')}`);
    }
    
    if (onClosedOverlap.length > 0) {
      errors.push(`On-season cannot overlap with closed months: ${onClosedOverlap.map(m => MONTHS[m-1].short).join(', ')}`);
    }
    
    if (offOnOverlap.length > 0) {
      errors.push(`Off-season and on-season cannot overlap: ${offOnOverlap.map(m => MONTHS[m-1].short).join(', ')}`);
    }
    
    // Check if prices are set when months are selected
    if (offSeason.length > 0 && !formData.off_season_price) {
      errors.push('Off-season price must be set when off-season months are selected');
    }
    
    if (onSeason.length > 0 && !formData.on_season_price) {
      errors.push('On-season price must be set when on-season months are selected');
    }
    
    return errors;
  };

  const handleUpdate = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Validate if month-related changes
    if (field.includes('month') || field.includes('price')) {
      const validationErrors = validateMonths(
        newData.off_season_months,
        newData.on_season_months,
        newData.closed_months
      );
      setErrors(validationErrors);
    }
    
    // Build the pricing object - only include if there's actual configuration
    const hasOffSeason = newData.off_season_months.length > 0 && newData.off_season_price;
    const hasOnSeason = newData.on_season_months.length > 0 && newData.on_season_price;
    const hasClosedMonths = newData.closed_months.length > 0;
    const hasLastMinute = newData.last_minute_enabled && newData.last_minute_days_before && newData.last_minute_discount_price;
    
    // Only send pricing data if at least something is configured
    if (hasOffSeason || hasOnSeason || hasClosedMonths || hasLastMinute) {
      const pricingData: Partial<HotelRoomPricing | VehiclePricing> = {
        off_season_months: newData.off_season_months,
        off_season_price: newData.off_season_price ? parseFloat(newData.off_season_price) : null,
        on_season_months: newData.on_season_months,
        on_season_price: newData.on_season_price ? parseFloat(newData.on_season_price) : null,
        closed_months: newData.closed_months,
        last_minute_enabled: newData.last_minute_enabled,
        last_minute_days_before: newData.last_minute_enabled && newData.last_minute_days_before 
          ? parseInt(newData.last_minute_days_before) 
          : null,
        last_minute_discount_price: newData.last_minute_enabled && newData.last_minute_discount_price 
          ? parseFloat(newData.last_minute_discount_price) 
          : null
      };
      
      onChange(pricingData);
    } else {
      // No pricing configured, send undefined
      onChange(undefined as any);
    }
  };

  const toggleMonth = (monthValue: number, field: 'off_season_months' | 'on_season_months' | 'closed_months') => {
    const currentMonths = formData[field];
    const newMonths = currentMonths.includes(monthValue)
      ? currentMonths.filter(m => m !== monthValue)
      : [...currentMonths, monthValue].sort((a, b) => a - b);
    
    handleUpdate(field, newMonths);
  };

  const getMonthBadgeVariant = (monthValue: number): 'default' | 'secondary' | 'destructive' => {
    if (formData.closed_months.includes(monthValue)) return 'destructive';
    if (formData.on_season_months.includes(monthValue)) return 'default';
    if (formData.off_season_months.includes(monthValue)) return 'secondary';
    return 'outline' as any;
  };

  const isMonthSelected = (monthValue: number): boolean => {
    return formData.off_season_months.includes(monthValue) ||
           formData.on_season_months.includes(monthValue) ||
           formData.closed_months.includes(monthValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Dynamic Pricing Configuration
        </CardTitle>
        <CardDescription>
          Configure seasonal pricing and availability. Set different prices for off-season, on-season, and last-minute bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Off-Season Pricing */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-semibold">Off-Season Pricing</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Select months with lower demand and set a reduced price
          </p>
          
          <div className="grid grid-cols-6 gap-2">
            {MONTHS.map(month => (
              <Badge
                key={month.value}
                variant={formData.off_season_months.includes(month.value) ? 'secondary' : 'outline'}
                className="cursor-pointer justify-center py-2"
                onClick={() => toggleMonth(month.value, 'off_season_months')}
              >
                {month.short}
              </Badge>
            ))}
          </div>
          
          {formData.off_season_months.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="off_season_price">Off-Season Price ({priceLabel})</Label>
              <Input
                id="off_season_price"
                type="number"
                step="1"
                min="0"
                value={formData.off_season_price}
                onChange={(e) => handleUpdate('off_season_price', e.target.value)}
                placeholder="e.g., 4000"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* On-Season Pricing */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-semibold">On-Season Pricing</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Select peak months with high demand and set a premium price
          </p>
          
          <div className="grid grid-cols-6 gap-2">
            {MONTHS.map(month => (
              <Badge
                key={month.value}
                variant={formData.on_season_months.includes(month.value) ? 'default' : 'outline'}
                className="cursor-pointer justify-center py-2"
                onClick={() => toggleMonth(month.value, 'on_season_months')}
              >
                {month.short}
              </Badge>
            ))}
          </div>
          
          {formData.on_season_months.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="on_season_price">On-Season Price ({priceLabel})</Label>
              <Input
                id="on_season_price"
                type="number"
                step="1"
                min="0"
                value={formData.on_season_price}
                onChange={(e) => handleUpdate('on_season_price', e.target.value)}
                placeholder="e.g., 8000"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Closed Months */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <Label className="text-base font-semibold">Closed/Unavailable Months</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Select months when this property/vehicle is completely unavailable
          </p>
          
          <div className="grid grid-cols-6 gap-2">
            {MONTHS.map(month => (
              <Badge
                key={month.value}
                variant={formData.closed_months.includes(month.value) ? 'destructive' : 'outline'}
                className="cursor-pointer justify-center py-2"
                onClick={() => toggleMonth(month.value, 'closed_months')}
              >
                {month.short}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Last-Minute Discount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Last-Minute Discount</Label>
            </div>
            <Switch
              checked={formData.last_minute_enabled}
              onCheckedChange={(checked) => handleUpdate('last_minute_enabled', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Offer a special discount for bookings made close to the date
          </p>
          
          {formData.last_minute_enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="last_minute_days_before">
                  Apply discount when booking is within (days before)
                </Label>
                <Input
                  id="last_minute_days_before"
                  type="number"
                  min="1"
                  max="14"
                  value={formData.last_minute_days_before}
                  onChange={(e) => handleUpdate('last_minute_days_before', e.target.value)}
                  placeholder="e.g., 2 (for 2 days before)"
                />
                <p className="text-xs text-muted-foreground">
                  Example: If set to 2, discount applies when today is within 2 days of the booking date
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_minute_discount_price">
                  Last-Minute Discount Price ({priceLabel})
                </Label>
                <Input
                  id="last_minute_discount_price"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.last_minute_discount_price}
                  onChange={(e) => handleUpdate('last_minute_discount_price', e.target.value)}
                  placeholder="e.g., 3500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold">Pricing Summary:</p>
          <ul className="text-sm space-y-1">
            {formData.off_season_months.length > 0 && (
              <li className="flex justify-between">
                <span>Off-Season ({formData.off_season_months.length} months):</span>
                <span className="font-medium">PKR {formData.off_season_price || '—'} {priceLabel}</span>
              </li>
            )}
            {formData.on_season_months.length > 0 && (
              <li className="flex justify-between">
                <span>On-Season ({formData.on_season_months.length} months):</span>
                <span className="font-medium">PKR {formData.on_season_price || '—'} {priceLabel}</span>
              </li>
            )}
            {formData.closed_months.length > 0 && (
              <li className="flex justify-between">
                <span className="text-destructive">Closed ({formData.closed_months.length} months):</span>
                <span className="font-medium text-destructive">Unavailable</span>
              </li>
            )}
            {formData.last_minute_enabled && (
              <li className="flex justify-between">
                <span>Last-Minute (within {formData.last_minute_days_before} days):</span>
                <span className="font-medium text-green-600">PKR {formData.last_minute_discount_price || '—'} {priceLabel}</span>
              </li>
            )}
            {formData.off_season_months.length === 0 && 
             formData.on_season_months.length === 0 && 
             formData.closed_months.length === 0 && (
              <li className="text-muted-foreground italic">No pricing rules configured yet</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
