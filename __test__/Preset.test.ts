import { describe, expect, test, beforeEach } from 'vitest'
import { addOtherInfo } from '@/utils'
import { usePersonConfig } from '@/store/personConfig'
import { createPinia, setActivePinia } from 'pinia'
import dayjs from 'dayjs'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Preset winner flow', () => {
  test('markPersonAsWinner sets preset flag', () => {
    const personStore = usePersonConfig()
    personStore.reset()
    personStore.addNotPersonList(addOtherInfo([{ uid: 'U1', name: 'A' }]))

    const persons = personStore.getAllPersonList
    const pid = persons[0].id

    personStore.markPersonAsWinner(pid, { id: 'P1', name: 'TestPrize', sort: 1, isAll: false, count: 1, isUsedCount: 0, picture: { id: '0', name: '', url: '' }, separateCount: { enable: false, countList: [] }, desc: '', isShow: false, isUsed: false, frequency: 1 })

    const updated = personStore.getAllPersonList.find(p => p.id === pid)
    expect(updated).toBeDefined()
    expect(updated!.preset).toBe(true)
    expect(updated!.prizeId).toEqual(['P1'])
  })

  test('preset included in not-person list candidates', () => {
    const personStore = usePersonConfig()
    personStore.reset()
    personStore.addNotPersonList(addOtherInfo([{ uid: 'U1', name: 'A' }, { uid: 'U2', name: 'B' }]))
    const persons = personStore.getAllPersonList
    const pid = persons[0].id
    // mark preset
    personStore.markPersonAsWinner(pid, { id: 'P1', name: 'TestPrize', sort: 1, isAll: false, count: 1, isUsedCount: 0, picture: { id: '0', name: '', url: '' }, separateCount: { enable: false, countList: [] }, desc: '', isShow: false, isUsed: false, frequency: 1 })

    const notList = personStore.getNotPersonList
    // Since preset should still be allowed in candidate pool, it should appear in notList
    const found = notList.find(p => p.id === pid)
    expect(found).toBeDefined()
  })

  test('preset cleared after addAlreadyPersonList used', () => {
    const personStore = usePersonConfig()
    personStore.reset()
    personStore.addNotPersonList(addOtherInfo([{ uid: 'U1', name: 'A' }]))
    const persons = personStore.getAllPersonList
    const pid = persons[0].id

    // mark preset
    personStore.markPersonAsWinner(pid, { id: 'P1', name: 'TestPrize', sort: 1, isAll: false, count: 1, isUsedCount: 0, picture: { id: '0', name: '', url: '' }, separateCount: { enable: false, countList: [] }, desc: '', isShow: false, isUsed: false, frequency: 1 })

    // Simulate drawing: addAlreadyPersonList should clear preset
    personStore.addAlreadyPersonList([persons[0]], { id: 'P1', name: 'TestPrize', sort: 1, isAll: false, count: 1, isUsedCount: 0, picture: { id: '0', name: '', url: '' }, separateCount: { enable: false, countList: [] }, desc: '', isShow: false, isUsed: false, frequency: 1 })

    const updated = personStore.getAllPersonList.find(p => p.id === pid)
    expect(updated!.preset).toBe(false)
  })
})