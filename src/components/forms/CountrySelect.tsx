
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string;
}

interface CountrySelectProps {
  onCountryChange: (country: Country) => void;
  onPhoneChange: (phone: string) => void;
  selectedCountry?: Country | null;
  phoneNumber?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  onCountryChange,
  onPhoneChange,
  selectedCountry,
  phoneNumber = ''
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    if (country) {
      onCountryChange(country);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove any non-numeric characters except plus
    const cleaned = value.replace(/[^\d]/g, '');
    onPhoneChange(cleaned);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <Select onValueChange={handleCountrySelect} value={selectedCountry?.id || ''}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading countries..." : "Select country"} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCountry && (
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
              <span className="text-sm font-medium text-gray-900">{selectedCountry.phone_code}</span>
            </div>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter phone number"
              className="rounded-l-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
