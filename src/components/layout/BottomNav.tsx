
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Baby, BarChart3, Search, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Baby, label: 'Baby', path: '/add-baby' },
    { icon: Search, label: 'Doctors', path: '/doctors' },
    { icon: BarChart3, label: 'Insights', path: '/insights' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg px-2 py-2 z-50">
      <div className="flex justify-around max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-0 ${
                isActive
                  ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { BottomNav };
