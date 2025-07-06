import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const LoadingScreen: React.FC = () => {
  const { activeTheme } = useTheme();

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 transition-all duration-500"
        style={{
          backgroundImage: `url(${activeTheme.backgroundImage})`,
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Dynamic Dark Overlay */}
      <div className={`fixed inset-0 bg-gradient-to-b ${activeTheme.gradientFrom} ${activeTheme.gradientVia} ${activeTheme.gradientTo} z-10 transition-all duration-500`} />
      
      {/* Loading Content */}
      <div className="relative z-20 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-turquoise-500 to-turquoise-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 animate-pulse">
          FA
        </div>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-turquoise-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-turquoise-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-turquoise-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-white/80 text-lg font-medium">FinanzApp wird geladen...</p>
        <p className="text-white/60 text-sm mt-2">Einen Moment bitte</p>
      </div>
    </div>
  );
};