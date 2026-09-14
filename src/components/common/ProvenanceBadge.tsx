import React from 'react';
import { DataProvenance } from '../../types';

interface ProvenanceBadgeProps {
  type: DataProvenance;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  size = 'xs',
  className = '',
}) => {
  const styles: Record<DataProvenance, { bg: string; text: string; border: string }> = {
    'USER PROVIDED': {
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
    },
    'SURVEY DATA': {
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-300',
      border: 'border-cyan-700/60',
    },
    'EXTERNAL DATA': {
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-700/60',
    },
    'AI INFERENCE': {
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-700/60',
    },
    'MODEL ESTIMATE': {
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
    },
    'SIMULATED PROTOTYPE DATA': {
      bg: 'bg-slate-900/80',
      text: 'text-slate-400',
      border: 'border-slate-700/60',
    },
  };

  const current = styles[type] || styles['SIMULATED PROTOTYPE DATA'];
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 tracking-wider',
    sm: 'text-xs px-2.5 py-1 tracking-wide',
    md: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      id={`provenance-${type.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center uppercase font-mono font-semibold rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
      title={`Data Provenance: ${type}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {type}
    </span>
  );
};
