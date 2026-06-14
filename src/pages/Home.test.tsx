import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/pages/Home'
import { timeSlots } from '@/data/timeSlots'
import { TimeSlot } from '@/types'

function makeSlot(overrides: Partial<TimeSlot> & { id: string }): TimeSlot {
  return {
    startTime: '06:00',
    endTime: '08:00',
    waveHeight: 0.5,
    windLevel: 2,
    suggestedLevel: 'beginner',
    safetyTips: ['安全提示一', '安全提示二', '安全提示三'],
    ...overrides,
  }
}

const dangerOnlyFixture: TimeSlot[] = [
  makeSlot({ id: 'd1', waveHeight: 1.8, windLevel: 6, suggestedLevel: 'advanced', safetyTips: ['A', 'B', 'C'] }),
  makeSlot({ id: 'd2', waveHeight: 2.0, windLevel: 7, suggestedLevel: 'advanced', safetyTips: ['D', 'E', 'F'] }),
]

describe('筛选 Chip 互斥切换', () => {
  it('默认选中「全部时段」', () => {
    render(<Home />)
    const allBtn = screen.getByRole('button', { name: '全部时段' })
    expect(allBtn.className).toContain('bg-ocean-500')
  })

  it('点击「仅看入门」后仅入门高亮，其余不亮', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /仅看入门/ }))

    const allBtn = screen.getByRole('button', { name: '全部时段' })
    const beginnerBtn = screen.getByRole('button', { name: /仅看入门/ })
    const advancedBtn = screen.getByRole('button', { name: /仅看进阶/ })

    expect(beginnerBtn.className).toContain('bg-emerald-500')
    expect(allBtn.className).not.toContain('bg-ocean-500')
    expect(advancedBtn.className).not.toContain('bg-amber-500')
  })

  it('点击「仅看进阶」后仅进阶高亮，其余不亮', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /仅看进阶/ }))

    const allBtn = screen.getByRole('button', { name: '全部时段' })
    const beginnerBtn = screen.getByRole('button', { name: /仅看入门/ })
    const advancedBtn = screen.getByRole('button', { name: /仅看进阶/ })

    expect(advancedBtn.className).toContain('bg-amber-500')
    expect(allBtn.className).not.toContain('bg-ocean-500')
    expect(beginnerBtn.className).not.toContain('bg-emerald-500')
  })

  it('从入门切到进阶，入门不高亮', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /仅看入门/ }))
    await user.click(screen.getByRole('button', { name: /仅看进阶/ }))

    const beginnerBtn = screen.getByRole('button', { name: /仅看入门/ })
    expect(beginnerBtn.className).not.toContain('bg-emerald-500')
  })
})

describe('筛选与排序独立', () => {
  it('入门筛选下，可见列表仍按浪高升序', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /仅看入门/ }))

    const waveElements = screen.getAllByTestId(/^wave-/)
    const waves = waveElements.map((el) => parseFloat(el.textContent!.replace('m', '')))
    for (let i = 1; i < waves.length; i++) {
      expect(waves[i]).toBeGreaterThanOrEqual(waves[i - 1])
    }
  })

  it('进阶筛选下，可见列表仍按浪高升序', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /仅看进阶/ }))

    const waveElements = screen.getAllByTestId(/^wave-/)
    const waves = waveElements.map((el) => parseFloat(el.textContent!.replace('m', '')))
    for (let i = 1; i < waves.length; i++) {
      expect(waves[i]).toBeGreaterThanOrEqual(waves[i - 1])
    }
  })

  it('筛选与行展开互不影响：先展开再切筛选，筛选逻辑独立于展开', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const sortedSlots = [...timeSlots].sort((a, b) => a.waveHeight - b.waveHeight)
    const firstSlot = sortedSlots[0]

    const row = screen.getByText(firstSlot.startTime)
      .closest('[class*="rounded-xl"]')!
    await user.click(within(row as HTMLElement).getByRole('button'))
    expect(screen.getByText(firstSlot.safetyTips[0])).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /仅看入门/ }))

    const waveElements = screen.getAllByTestId(/^wave-/)
    const waves = waveElements.map((el) => parseFloat(el.textContent!.replace('m', '')))
    for (let i = 1; i < waves.length; i++) {
      expect(waves[i]).toBeGreaterThanOrEqual(waves[i - 1])
    }
  })
})

describe('双口径统计', () => {
  it('「共 N 个时段」计数与 danger 行数分别独立断言', () => {
    render(<Home />)

    const countMatch = screen.getByText(/共 \d+ 个时段/).textContent!.match(/共 (\d+) 个时段/)
    expect(countMatch).not.toBeNull()
    const totalCount = parseInt(countMatch![1], 10)
    expect(totalCount).toBe(6)

    const dangerRows = screen.getAllByText('注意')
    expect(dangerRows.length).toBeGreaterThanOrEqual(1)
    expect(dangerRows.length).toBeLessThan(totalCount)
    expect(dangerRows.length).not.toBe(totalCount)
  })

  it('页脚显示浪高 ≥ 1.2m 警告', () => {
    render(<Home />)
    expect(screen.getByText(/浪高 ≥ 1\.2 米/)).toBeTruthy()
  })

  it('入门筛选后「共 N 个时段」计数减少', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const beforeText = screen.getByText(/共 \d+ 个时段/).textContent!
    const beforeCount = parseInt(beforeText.match(/共 (\d+) 个时段/)![1], 10)

    await user.click(screen.getByRole('button', { name: /仅看入门/ }))

    const afterText = screen.getByText(/共 \d+ 个时段/).textContent!
    const afterCount = parseInt(afterText.match(/共 (\d+) 个时段/)![1], 10)

    expect(afterCount).toBeLessThan(beforeCount)
  })

  it('danger 行阈值 1.2m 与页脚说明一致', () => {
    render(<Home />)

    const dangerWaveSlots = timeSlots.filter((s) => s.waveHeight >= 1.2)
    const dangerBadges = screen.getAllByText('注意')
    expect(dangerBadges.length).toBe(dangerWaveSlots.length)
  })
})

describe('展开闭环', () => {
  it('点时段行展开该段三条安全提示', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const sortedSlots = [...timeSlots].sort((a, b) => a.waveHeight - b.waveHeight)
    const firstSlot = sortedSlots[0]

    const row = screen.getByText(firstSlot.startTime)
      .closest('[class*="rounded-xl"]')!
    await user.click(within(row as HTMLElement).getByRole('button'))

    expect(screen.getByText('安全提示')).toBeTruthy()
    for (const tip of firstSlot.safetyTips) {
      expect(screen.getByText(tip)).toBeTruthy()
    }
  })

  it('切换 chip 后若当前展开项被筛掉则自动收起', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const sortedSlots = [...timeSlots].sort((a, b) => a.waveHeight - b.waveHeight)
    const dangerSlot = sortedSlots.find((s) => s.waveHeight >= 1.2)!

    const row = screen.getByText(dangerSlot.startTime)
      .closest('[class*="rounded-xl"]')!
    await user.click(within(row as HTMLElement).getByRole('button'))

    expect(screen.getByText(dangerSlot.safetyTips[0])).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /仅看入门/ }))

    expect(screen.queryByText(dangerSlot.safetyTips[0])).toBeNull()
  })

  it('筛回可见时段后可再次展开', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await user.click(screen.getByRole('button', { name: /仅看入门/ }))
    await user.click(screen.getByRole('button', { name: '全部时段' }))

    const sortedSlots = [...timeSlots].sort((a, b) => a.waveHeight - b.waveHeight)
    const firstSlot = sortedSlots[0]

    const row = screen.getByText(firstSlot.startTime)
      .closest('[class*="rounded-xl"]')!
    await user.click(within(row as HTMLElement).getByRole('button'))

    expect(screen.getByText(firstSlot.safetyTips[0])).toBeTruthy()
  })

  it('再次点击同一行收起展开', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const sortedSlots = [...timeSlots].sort((a, b) => a.waveHeight - b.waveHeight)
    const firstSlot = sortedSlots[0]

    const row = screen.getByText(firstSlot.startTime)
      .closest('[class*="rounded-xl"]')!
    const btn = within(row as HTMLElement).getByRole('button')

    await user.click(btn)
    expect(screen.getByText(firstSlot.safetyTips[0])).toBeTruthy()

    await user.click(btn)
    expect(screen.queryByText(firstSlot.safetyTips[0])).toBeNull()
  })
})

describe('筛选零结果空态', () => {
  it('测试专用 fixture 构造零结果：展示空态文案', async () => {
    const user = userEvent.setup()
    render(<Home data={dangerOnlyFixture} />)

    await user.click(screen.getByRole('button', { name: /仅看入门/ }))

    expect(screen.getByText('暂无符合条件的时段')).toBeTruthy()
  })

  it('空态点「关闭筛选，查看全部时段」恢复全量', async () => {
    const user = userEvent.setup()
    render(<Home data={dangerOnlyFixture} />)

    await user.click(screen.getByRole('button', { name: /仅看入门/ }))
    expect(screen.getByText('暂无符合条件的时段')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /关闭筛选/ }))

    const countText = screen.getByText(/共 \d+ 个时段/)
    expect(countText.textContent).toMatch(/共 2 个时段/)
  })
})
