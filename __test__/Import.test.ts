import { addOtherInfo } from '@/utils'
import { describe, expect, test } from 'vitest'

describe('Import preset winners', () => {
  test('should normalize isWin and prize fields from import', () => {
    const input = [
      { uid: 'U1', name: 'Alice', isWin: 'yes', prizeName: '一等奖', prizeId: '001' },
      { uid: 'U2', name: 'Bob', isWin: 'no', prizeName: '', prizeId: '' },
    ]

    const out = addOtherInfo(JSON.parse(JSON.stringify(input)))

    expect(out[0].isWin).toBe(true)
    expect(out[0].prizeName).toEqual(['一等奖'])
    expect(out[0].prizeId).toEqual(['001'])
    expect(out[0].prizeTime.length).toBeGreaterThanOrEqual(1)

    expect(out[1].isWin).toBe(false)
    expect(out[1].prizeName).toEqual([])
    expect(out[1].prizeId).toEqual([])
  })
})
