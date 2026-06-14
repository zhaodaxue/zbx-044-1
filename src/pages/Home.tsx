import { useState, useMemo } from 'react';
import { Waves, Wind, ChevronDown, Shield, AlertTriangle, User } from 'lucide-react';
import { timeSlots } from '@/data/timeSlots';
import { Level, FilterMode } from '@/types';
import { cn } from '@/lib/utils';

export default function Home() {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedSlots = useMemo(() => {
    return [...timeSlots].sort((a, b) => a.waveHeight - b.waveHeight);
  }, []);

  const filteredSlots = useMemo(() => {
    if (filterMode === 'all') return sortedSlots;
    if (filterMode === 'beginner') {
      return sortedSlots.filter(
        (slot) => !(slot.waveHeight > 0.8 && slot.windLevel >= 4)
      );
    }
    if (filterMode === 'advanced') {
      return sortedSlots.filter((slot) => !(slot.waveHeight > 1.5));
    }
    return sortedSlots;
  }, [sortedSlots, filterMode]);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
  };

  const getLevelLabel = (level: Level) => {
    return level === 'beginner' ? '入门' : '进阶';
  };

  const getLevelColorClass = (level: Level) => {
    return level === 'beginner'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const isDangerRow = (waveHeight: number) => waveHeight >= 1.2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-ocean-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ocean-500 mb-4 shadow-lg shadow-ocean-200">
            <Waves className="w-8 h-8 text-white animate-wave" />
          </div>
          <h1 className="text-3xl font-bold text-ocean-900 mb-2">
            江面皮划艇下水适宜度
          </h1>
          <p className="text-ocean-600">今日浪级推荐 · 安全出行</p>
        </header>

        {/* 筛选 Chip */}
        <div className="flex gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => handleFilterChange('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
              filterMode === 'all'
                ? 'bg-ocean-500 text-white border-ocean-500 shadow-md shadow-ocean-200'
                : 'bg-white text-ocean-700 border-ocean-200 hover:border-ocean-400 hover:bg-ocean-50'
            )}
          >
            全部时段
          </button>
          <button
            onClick={() => handleFilterChange('beginner')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5',
              filterMode === 'beginner'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
            )}
          >
            <User className="w-4 h-4" />
            仅看入门
          </button>
          <button
            onClick={() => handleFilterChange('advanced')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5',
              filterMode === 'advanced'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200'
                : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
            )}
          >
            <User className="w-4 h-4" />
            仅看进阶
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mb-4 text-sm text-ocean-600 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          共 {filteredSlots.length} 个时段 · 按浪高升序排列
        </div>

        {/* 时段列表 */}
        <div className="space-y-3">
          {filteredSlots.map((slot, index) => {
            const isExpanded = expandedId === slot.id;
            const danger = isDangerRow(slot.waveHeight);

            return (
              <div
                key={slot.id}
                className={cn(
                  'rounded-xl overflow-hidden transition-all duration-300 animate-fade-in-up',
                  danger
                    ? 'bg-red-50 border-2 border-red-300 shadow-md shadow-red-100'
                    : 'bg-white border border-ocean-100 shadow-sm hover:shadow-md hover:border-ocean-200'
                )}
                style={{ animationDelay: `${0.2 + index * 0.08}s` }}
              >
                <button
                  onClick={() => handleToggleExpand(slot.id)}
                  className={cn(
                    'w-full px-5 py-4 text-left flex items-center justify-between transition-colors',
                    danger ? 'hover:bg-red-100/50' : 'hover:bg-ocean-50/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* 时段 */}
                    <div className="text-center min-w-[100px]">
                      <div className={cn(
                        'text-xl font-bold',
                        danger ? 'text-red-700' : 'text-ocean-900'
                      )}>
                        {slot.startTime}
                      </div>
                      <div className={cn(
                        'text-xs',
                        danger ? 'text-red-500' : 'text-ocean-400'
                      )}>
                        – {slot.endTime}
                      </div>
                    </div>

                    {/* 分隔线 */}
                    <div className={cn(
                      'w-px h-10',
                      danger ? 'bg-red-200' : 'bg-ocean-100'
                    )} />

                    {/* 浪高和风力 */}
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          danger ? 'bg-red-100' : 'bg-ocean-100'
                        )}>
                          <Waves className={cn(
                            'w-5 h-5',
                            danger ? 'text-red-500' : 'text-ocean-500'
                          )} />
                        </div>
                        <div>
                          <div className={cn(
                            'text-lg font-bold',
                            danger ? 'text-red-700' : 'text-ocean-900'
                          )}>
                            {slot.waveHeight.toFixed(1)}m
                          </div>
                          <div className={cn(
                            'text-xs',
                            danger ? 'text-red-500' : 'text-ocean-400'
                          )}>
                            浪高
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          danger ? 'bg-red-100' : 'bg-ocean-100'
                        )}>
                          <Wind className={cn(
                            'w-5 h-5',
                            danger ? 'text-red-500' : 'text-ocean-500'
                          )} />
                        </div>
                        <div>
                          <div className={cn(
                            'text-lg font-bold',
                            danger ? 'text-red-700' : 'text-ocean-900'
                          )}>
                            {slot.windLevel}级
                          </div>
                          <div className={cn(
                            'text-xs',
                            danger ? 'text-red-500' : 'text-ocean-400'
                          )}>
                            风力
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* 建议等级标签 */}
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      getLevelColorClass(slot.suggestedLevel)
                    )}>
                      {getLevelLabel(slot.suggestedLevel)}
                    </span>

                    {/* 危险警告 */}
                    {danger && (
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">注意</span>
                      </div>
                    )}

                    {/* 展开箭头 */}
                    <ChevronDown className={cn(
                      'w-5 h-5 transition-transform duration-300',
                      isExpanded ? 'rotate-180' : '',
                      danger ? 'text-red-400' : 'text-ocean-300'
                    )} />
                  </div>
                </button>

                {/* 展开的安全提示 */}
                {isExpanded && (
                  <div className={cn(
                    'px-5 pb-5 pt-2 border-t animate-expand-down',
                    danger ? 'border-red-200 bg-red-50/50' : 'border-ocean-100 bg-ocean-50/30'
                  )}>
                    <div className={cn(
                      'flex items-center gap-2 mb-3',
                      danger ? 'text-red-600' : 'text-ocean-600'
                    )}>
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">安全提示</span>
                    </div>
                    <ul className="space-y-2">
                      {slot.safetyTips.map((tip, tipIndex) => (
                        <li
                          key={tipIndex}
                          className={cn(
                            'flex items-start gap-2 text-sm pl-2',
                            danger ? 'text-red-600' : 'text-ocean-700'
                          )}
                        >
                          <span className={cn(
                            'mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                            danger ? 'bg-red-400' : 'bg-ocean-400'
                          )} />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 底部说明 */}
        <footer className="mt-8 text-center text-sm text-ocean-500 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p>江面情况多变，下水前请咨询当日值班教练</p>
          <p className="mt-1">⚠️ 浪高 ≥ 1.2 米时需特别注意安全</p>
        </footer>
      </div>
    </div>
  );
}
