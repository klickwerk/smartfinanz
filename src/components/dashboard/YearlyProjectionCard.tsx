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

  const maxValue = Math.max(...Object.values(yearlyData.quarters), 1); // Mindestens 1 für Division
  const hasData = yearlyData.total > 0;