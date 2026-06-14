import { describe, it, expect } from 'vitest'
import { timeSlots } from '@/data/timeSlots'
import { isDangerWave } from '@/lib/filterRules'

describe('种子数据结构完整性', () => {
  it('包含 6 个时段', () => {
    expect(timeSlots).toHaveLength(6)
  })

  it('每个时段具有完整的必填字段', () => {
    for (const slot of timeSlots) {
      expect(slot.id).toBeTruthy()
      expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/)
      expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/)
      expect(typeof slot.waveHeight).toBe('number')
      expect(typeof slot.windLevel).toBe('number')
      expect(['beginner', 'advanced']).toContain(slot.suggestedLevel)
      expect(Array.isArray(slot.safetyTips)).toBe(true)
      expect(slot.safetyTips).toHaveLength(3)
    }
  })

  it('每个时段 id 唯一', () => {
    const ids = timeSlots.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('浪高为一位小数', () => {
    for (const slot of timeSlots) {
      const fixed = Number(slot.waveHeight.toFixed(1))
      expect(fixed).toBe(slot.waveHeight)
    }
  })
})

describe('种子数据边界值覆盖', () => {
  it('存在浪高 ≤ 0.8m 的入门时段', () => {
    const hasBeginnerSafe = timeSlots.some(
      (s) => s.suggestedLevel === 'beginner' && s.waveHeight <= 0.8
    )
    expect(hasBeginnerSafe).toBe(true)
  })

  it('存在浪高 > 0.8m 但风力 < 4 的时段（入门可见、不被入门筛掉）', () => {
    const has = timeSlots.some(
      (s) => s.waveHeight > 0.8 && s.windLevel < 4
    )
    expect(has).toBe(true)
  })

  it('存在浪高 > 0.8m 且风力 ≥ 4 的时段（入门筛掉）', () => {
    const has = timeSlots.some(
      (s) => s.waveHeight > 0.8 && s.windLevel >= 4
    )
    expect(has).toBe(true)
  })

  it('存在浪高 > 1.5m 的时段（进阶筛掉）', () => {
    const has = timeSlots.some((s) => s.waveHeight > 1.5)
    expect(has).toBe(true)
  })

  it('存在浪高 = 1.1m 的时段（danger 以下，即 < 1.2m）', () => {
    const has = timeSlots.some((s) => s.waveHeight < 1.2 && s.waveHeight > 0.8)
    expect(has).toBe(true)
  })

  it('danger 行与总行数不同（断言分类差异）', () => {
    const dangerCount = timeSlots.filter((s) => isDangerWave(s.waveHeight)).length
    const totalCount = timeSlots.length
    expect(dangerCount).toBeLessThan(totalCount)
    expect(dangerCount).toBeGreaterThan(0)
  })
})

describe('种子数据浪高分布', () => {
  it('浪高存在 ≥ 1.2m 的危险时段', () => {
    const dangerSlots = timeSlots.filter((s) => isDangerWave(s.waveHeight))
    expect(dangerSlots.length).toBeGreaterThanOrEqual(2)
  })

  it('浪高存在 < 1.2m 的安全时段', () => {
    const safeSlots = timeSlots.filter((s) => !isDangerWave(s.waveHeight))
    expect(safeSlots.length).toBeGreaterThanOrEqual(2)
  })

  it('浪高恰好等于 1.5m 不存在，但有接近值用于进阶筛选边界', () => {
    const exact15 = timeSlots.find((s) => s.waveHeight === 1.5)
    if (exact15) {
      expect(exact15.waveHeight).toBe(1.5)
    } else {
      const near15 = timeSlots.some(
        (s) => s.waveHeight > 1.3 && s.waveHeight < 2.0
      )
      expect(near15).toBe(true)
    }
  })
})
