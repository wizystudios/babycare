
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Baby, BarChart3, Search, User, Calendar, Stethoscope, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  // Different navigation items based on user role
  const getNavItems = () => {
    if (userRole === 'doctor') {
      return [
        { icon: Home, label: 'Dashboard', path: '/doctor-dashboard' },
        { icon: Calendar, label: 'Requests', path: '/doctor-dashboard' },
        { icon: Search, label: 'Patients', path: '/patients' },
        { icon: Stethoscope, label: 'Profile', path: '/profile' },
      ];
    }
    
    // Default parent navigation
    return [
      { icon: Home, label: 'Home', path: '/dashboard' },
      { icon: Baby, label: 'Baby', path: '/add-baby' },
      { icon: Heart, label: 'Health', path: '/healthcare' },
      { icon: Stethoscope, label: 'Specialist', path: '/specialists' },
      { icon: BarChart3, label: 'Insights', path: '/insights' },
      { icon: User, label: 'Profile', path: '/profile' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-primary/20 px-2 py-0.5 z-50">
      <div className="flex justify-around max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-1.5 px-1.5 rounded-xl transition-all duration-300 min-w-0 ${
                isActive
                  ? 'bg-gradient-to-br from-primary via-primary to-secondary text-white scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-gentle-pulse' : ''}`} />
              <span className="text-[9px] font-medium truncate sm:hidden">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { BottomNav };
