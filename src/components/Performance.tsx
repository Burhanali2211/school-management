"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const Performance = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Academic Performance</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-success-600" />
            <span className="text-sm font-medium text-success-600">+12%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Attendance Rate</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-success-600" />
            <span className="text-sm font-medium text-success-600">+5%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Participation</span>
          <div className="flex items-center gap-1">
            <Minus className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">0%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Performance; 