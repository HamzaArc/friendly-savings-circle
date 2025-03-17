
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DollarSign, PoundSterling, Euro } from "lucide-react";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  icon: JSX.Element;
}

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

const CurrencySelector = ({ 
  value, 
  onChange, 
  label = "Currency", 
  description 
}: CurrencySelectorProps) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  
  useEffect(() => {
    // In a real app, these might be fetched from an API or config
    const availableCurrencies: Currency[] = [
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        icon: <Euro className="h-4 w-4" />
      },
      {
        code: "GBP",
        name: "British Pound",
        symbol: "£",
        icon: <PoundSterling className="h-4 w-4" />
      },
      {
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "CA$",
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        code: "AUD",
        name: "Australian Dollar",
        symbol: "A$",
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        code: "JPY",
        name: "Japanese Yen",
        symbol: "¥",
        icon: <span className="text-sm">¥</span>
      },
      {
        code: "CNY",
        name: "Chinese Yuan",
        symbol: "¥",
        icon: <span className="text-sm">¥</span>
      },
      {
        code: "INR",
        name: "Indian Rupee",
        symbol: "₹",
        icon: <span className="text-sm">₹</span>
      },
      {
        code: "NGN",
        name: "Nigerian Naira",
        symbol: "₦",
        icon: <span className="text-sm">₦</span>
      },
      {
        code: "ZAR",
        name: "South African Rand",
        symbol: "R",
        icon: <span className="text-sm">R</span>
      }
    ];
    
    setCurrencies(availableCurrencies);
    
    // Set default if not already set
    if (!value && availableCurrencies.length > 0) {
      onChange(availableCurrencies[0].code);
    }
  }, []);
  
  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find(currency => currency.code === code);
  };
  
  const selectedCurrency = getCurrencyByCode(value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select currency">
            {selectedCurrency && (
              <div className="flex items-center">
                <span className="mr-2">{selectedCurrency.icon}</span>
                <span>{selectedCurrency.code} - {selectedCurrency.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center">
                <span className="mr-2">{currency.icon}</span>
                <span>{currency.code} - {currency.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
