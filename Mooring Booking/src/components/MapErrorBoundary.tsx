import React, { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Mediterranean countries with moorings - used as fallback
const mediterraneanCountries = [
  { name: "Croatia", moorings: 2500, flag: "🇭🇷" },
  { name: "Greece", moorings: 2100, flag: "🇬🇷" },
  { name: "Italy", moorings: 1800, flag: "🇮🇹" },
  { name: "Spain", moorings: 1200, flag: "🇪🇸" },
  { name: "France", moorings: 950, flag: "🇫🇷" },
  { name: "Turkey", moorings: 800, flag: "🇹🇷" },
  { name: "Albania", moorings: 350, flag: "🇦🇱" },
  { name: "Malta", moorings: 280, flag: "🇲🇹" },
  { name: "Slovenia", moorings: 180, flag: "🇸🇮" },
  { name: "Montenegro", moorings: 320, flag: "🇲🇪" },
  { name: "Cyprus", moorings: 420, flag: "🇨🇾" },
];

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback - static grid of countries (NO duplicate button)
      return (
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediterraneanCountries.map((country) => (
              <Link 
                key={country.name}
                to={`/explore?search=${country.name}`}
                className="bg-card rounded-xl p-4 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 text-center group"
              >
                <span 
                  className="text-4xl block mb-2"
                  style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, sans-serif' }}
                >
                  {country.flag}
                </span>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {country.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {country.moorings.toLocaleString()} moorings
                </p>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
