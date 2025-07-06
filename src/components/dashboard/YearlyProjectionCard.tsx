import React from 'react';
import { BarChart3, Target } from 'lucide-react';
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

  const maxValue = Math.max(...Object.values(yearlyData.quarters));

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Jahresprognose</h3>
            <p className="text-white/60 text-sm">{yearlyData.year}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-purple-400 font-bold text-xl">€{yearlyData.total.toLocaleString('de-AT')}</p>
          <p className="text-white/60 text-sm">Gesamt erwartet</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 mb-6 h-24">
        {quarters.map((quarter) => (
          <div key={quarter.name} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col justify-end h-16">
              <div 
                className={`${quarter.color} rounded-t-md transition-all duration-700 ease-out`}
                style={{ height: `${(quarter.value / maxValue) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-xs mt-2">{quarter.name}</p>
            <p className="text-white text-xs font-medium">€{(quarter.value / 1000).toFixed(0)}k</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
        <Target className="w-5 h-5 text-purple-400" />
        <div className="flex-1">
          <p className="text-white font-medium text-sm">Sparziel 2025</p>
          <p className="text-white/60 text-xs">€15.000 angestrebt</p>
        </div>
        <div className="text-right">
          <p className="text-purple-400 font-semibold">78%</p>
          <p className="text-white/60 text-xs">erreicht</p>
        </div>
      </div>
    </GlassCard>
  );
};