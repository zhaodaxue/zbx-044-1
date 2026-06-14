import { describe, it, expect } from 'vitest'
import { filterSlots, sortByWaveHeight, isDangerWave, getLevelLabel } from '@/lib/filterRules'
import { TimeSlot } from '@/types'

function makeSlot(overrides: Partial<TimeSlot> & { id: string }): TimeSlot {
  return {
    startTime: '06:00',
    endTime: '08:00',
    waveHeight: 0.5,
    windLevel: 2,
    suggestedLevel: 'beginner',
    safetyTips: ['提示1', '提示2', '提示3'],
    ...overrides,
  }
}

describe('sortByWaveHeight', () => {
  it('按浪高升序排列', () => {
    const slots = [
      makeSlot({ id: 'a', waveHeight: 1.5 }),
      makeSlot({ id: 'b', waveHeight: 0.3 }),
      makeSlot({ id: 'c', waveHeight: 1.1 }),
    ]
    const result = sortByWaveHeight(slots)
    expect(result.map((s) => s.waveHeight)).toEqual([0.3, 1.1, 1.5])
  })

  it('不修改原数组', () => {
    const slots = [
      makeSlot({ id: 'a', waveHeight: 1.5 }),
      makeSlot({ id: 'b', waveHeight: 0.3 }),
    ]
    const original = [...slots]
    sortByWaveHeight(slots)
    expect(slots.map((s) => s.id)).toEqual(original.map((s) => s.id))
  })
})

describe('filterSlots - 入门筛选规则', () => {
  it('入门模式：隐藏浪高严格大于 0.8m 且风力 ≥ 4 级的时段', () => {
    const slots = [
      makeSlot({ id: 'hide', waveHeight: 1.0, windLevel: 4 }),
      makeSlot({ id: 'show1', waveHeight: 0.5, windLevel: 4 }),
      makeSlot({ id: 'show2', waveHeight: 1.0, windLevel: 3 }),
      makeSlot({ id: 'show3', waveHeight: 0.8, windLevel: 4 }),
    ]
    const result = filterSlots(slots, 'beginner')
    expect(result.map((s) => s.id)).toEqual(['show1', 'show2', 'show3'])
  })

  it('边界值：浪高恰好 0.8m、风力 4 级 → 不隐藏（浪高未严格大于 0.8）', () => {
    const slot = makeSlot({ id: 'boundary', waveHeight: 0.8, windLevel: 4 })
    const result = filterSlots([slot], 'beginner')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('boundary')
  })

  it('边界值：浪高 0.9m（> 0.8）、风力 3 级（< 4） → 不隐藏（需同时满足两个条件）', () => {
    const slot = makeSlot({ id: 'wind-below', waveHeight: 0.9, windLevel: 3 })
    const result = filterSlots([slot], 'beginner')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('wind-below')
  })

  it('边界值：浪高 0.9m（> 0.8）、风力恰好 4 级 → 隐藏', () => {
    const slot = makeSlot({ id: 'wind-exact', waveHeight: 0.9, windLevel: 4 })
    const result = filterSlots([slot], 'beginner')
    expect(result).toHaveLength(0)
  })

  it('边界值：浪高 0.8m、风力 5 级 → 不隐藏（浪高未严格大于 0.8）', () => {
    const slot = makeSlot({ id: 'wave-below', waveHeight: 0.8, windLevel: 5 })
    const result = filterSlots([slot], 'beginner')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('wave-below')
  })

  it('入门筛选与排序独立：筛选结果保持传入顺序', () => {
    const slots = [
      makeSlot({ id: 'a', waveHeight: 1.0, windLevel: 4 }),
      makeSlot({ id: 'b', waveHeight: 0.5, windLevel: 2 }),
      makeSlot({ id: 'c', waveHeight: 0.3, windLevel: 1 }),
    ]
    const result = filterSlots(slots, 'beginner')
    expect(result.map((s) => s.id)).toEqual(['b', 'c'])
  })
})

describe('filterSlots - 进阶筛选规则', () => {
  it('进阶模式：隐藏浪高严格大于 1.5m 的时段', () => {
    const slots = [
      makeSlot({ id: 'hide', waveHeight: 1.8 }),
      makeSlot({ id: 'show1', waveHeight: 1.0 }),
      makeSlot({ id: 'show2', waveHeight: 1.5 }),
    ]
    const result = filterSlots(slots, 'advanced')
    expect(result.map((s) => s.id)).toEqual(['show1', 'show2'])
  })

  it('边界值：浪高恰好 1.5m → 不隐藏（未严格大于 1.5）', () => {
    const slot = makeSlot({ id: 'boundary', waveHeight: 1.5 })
    const result = filterSlots([slot], 'advanced')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('boundary')
  })

  it('边界值：浪高 1.6m（> 1.5）→ 隐藏', () => {
    const slot = makeSlot({ id: 'above', waveHeight: 1.6 })
    const result = filterSlots([slot], 'advanced')
    expect(result).toHaveLength(0)
  })

  it('进阶筛选不考虑风力', () => {
    const slot = makeSlot({ id: 'high-wind', waveHeight: 1.2, windLevel: 6 })
    const result = filterSlots([slot], 'advanced')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('high-wind')
  })
})

describe('filterSlots - 全部模式', () => {
  it('全部模式：不过滤，原样返回', () => {
    const slots = [
      makeSlot({ id: 'a', waveHeight: 1.8, windLevel: 6 }),
      makeSlot({ id: 'b', waveHeight: 0.3, windLevel: 1 }),
    ]
    const result = filterSlots(slots, 'all')
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.id)).toEqual(['a', 'b'])
  })
})

describe('isDangerWave', () => {
  it('浪高 1.2m → 危险', () => {
    expect(isDangerWave(1.2)).toBe(true)
  })

  it('浪高 1.19m → 不危险', () => {
    expect(isDangerWave(1.19)).toBe(false)
  })

  it('浪高 1.5m → 危险', () => {
    expect(isDangerWave(1.5)).toBe(true)
  })

  it('浪高 0.8m → 不危险', () => {
    expect(isDangerWave(0.8)).toBe(false)
  })
})

describe('getLevelLabel', () => {
  it('入门 → 入门', () => {
    expect(getLevelLabel('beginner')).toBe('入门')
  })

  it('进阶 → 进阶', () => {
    expect(getLevelLabel('advanced')).toBe('进阶')
  })
})
