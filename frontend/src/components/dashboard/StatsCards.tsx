'use client';

import { TaskStats } from '@/types';
import { CheckCircle, Circle, Clock, ListTodo } from 'lucide-react';

interface Props {
  stats: TaskStats | null;
  isLoading: boolean;
}

interface StatCard {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function StatsCards({ stats, isLoading }: Props) {
  const cards: StatCard[] = [
    {
      label: 'Total Tasks',
      value: stats?.total,
      icon: <ListTodo className="w-5 h-5" />,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Pending',
      value: stats?.pending,
      icon: <Circle className="w-5 h-5" />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: stats?.completed,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {card.label}
            </span>
            <div className={`${card.bg} ${card.color} p-1.5 rounded-lg`}>
              {card.icon}
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className={`text-3xl font-bold ${card.color}`}>
              {card.value ?? 0}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
