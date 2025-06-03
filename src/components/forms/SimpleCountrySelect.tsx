
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimpleCountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const SimpleCountrySelect: React.FC<SimpleCountrySelectProps> = ({
  value,
  onValueChange,
  className = ''
}) => {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'PT', name: 'Portugal' },
    { code: 'IE', name: 'Ireland' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'SG', name: 'Singapore' },
    { code: 'KR', name: 'South Korea' },
    { code: 'TH', name: 'Thailand' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'MA', name: 'Morocco' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'GH', name: 'Ghana' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'UG', name: 'Uganda' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PA', name: 'Panama' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HN', name: 'Honduras' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'BZ', name: 'Belize' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'BB', name: 'Barbados' },
    { code: 'GD', name: 'Grenada' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'DM', name: 'Dominica' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'CU', name: 'Cuba' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'HT', name: 'Haiti' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'VI', name: 'U.S. Virgin Islands' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'GU', name: 'Guam' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'PW', name: 'Palau' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'NR', name: 'Nauru' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'TO', name: 'Tonga' },
    { code: 'WS', name: 'Samoa' }
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`rounded-xl border-blue-300 ${className}`}>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.name}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
