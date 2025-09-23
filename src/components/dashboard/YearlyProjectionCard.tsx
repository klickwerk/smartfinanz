import React from 'react';
import { BarChart3, Target, TrendingUp } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { YearlyData } from '../../types';

interface YearlyProjectionCardProps {
  yearlyData: YearlyData;
}

export const YearlyProjectionCard: React.FC<YearlyProjectionCardProps> = ({ yearlyData }) => {
  const quarters = [
    { name: 'Q1', value: yearlyData.quarters.q1, color: 'bg-turquoise-500' },
    { name: 'Q2', value: yearlyData.quarters.q2, color: 'bg-turquoise-400' },
    { name: 'Q3', value: yearlyData.quarters.q3, color: 'bg-turquoise-300' },
    { name: 'Q4', value: yearlyData.quarters.q4, color: 'bg-turquoise-200' }
  ];

  const maxValue = Math.max(...Object.values(yearlyData.quarters), 1);
  const hasData = yearlyData.total > 0;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
            <BarChart3 className="w-5 h-5 text-turquoise-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Jahresprojektion</h3>
            <p className="text-white/60 text-sm">Quartalsziele</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-turquoise-400 font-bold text-xl">€{yearlyData.total.toLocaleString('de-AT')}</p>
          <p className="text-white/60 text-sm">Gesamtziel</p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {quarters.map((quarter) => (
              <div key={quarter.name} className="text-center">
                <div className="mb-2">
                  <div className="h-20 bg-white/5 rounded-lg flex items-end p-1">
                    <div 
                      className={`w-full ${quarter.color} rounded transition-all duration-700`}
                      style={{ 
                        height: `${(quarter.value / maxValue) * 100}%`,
                        minHeight: quarter.value > 0 ? '8px' : '0px'
                      }}
                    />
                  </div>
                </div>
                <p className="text-white/60 text-xs font-medium">{quarter.name}</p>
                <p className="text-white text-sm font-semibold">€{quarter.value.toLocaleString('de-AT')}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-turquoise-400">
            <Target className="w-4 h-4" />
            <span>Auf Kurs für {new Date().getFullYear()}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">Noch keine Jahresziele definiert</p>
          <p className="text-white/40 text-xs mt-1">Erstelle Budgets um deine Jahresprojektion zu sehen</p>
        </div>
      )}
    </GlassCard>
  );
};