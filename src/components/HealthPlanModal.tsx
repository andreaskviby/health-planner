'use client';

import { X, Target, Calendar } from 'lucide-react';
import { HealthPlan } from '@/lib/types';

interface HealthPlanModalProps {
  healthPlan: HealthPlan;
  onClose: () => void;
}

export default function HealthPlanModal({ healthPlan, onClose }: HealthPlanModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold text-white">Din Personliga Hälsoplan</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 flex items-center text-sm text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          Skapad {new Date(healthPlan.createdAt).toLocaleDateString('sv-SE')}
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-700/50 rounded-lg p-4 whitespace-pre-wrap text-gray-200 leading-relaxed">
            {healthPlan.plan}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}