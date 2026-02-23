import type { IPersonConfig, IPrizeConfig } from '@/types/storeType'

import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { defaultPersonList } from './data'
import { usePrizeConfig } from './prizeConfig'

export const usePersonConfig = defineStore('person', {
  state() {
    return {
      personConfig: {
        allPersonList: [] as IPersonConfig[],
        alreadyPersonList: [] as IPersonConfig[],
      },
    }
  },
  getters: {
    // 获取全部配置
    getPersonConfig(state) {
      return state.personConfig
    },
    // 获取全部人员名单
    getAllPersonList(state) {
      return state.personConfig.allPersonList.filter((item: IPersonConfig) => {
        return item
      })
    },
    // 获取未获此奖的人员名单
    getNotThisPrizePersonList(state: any) {
      const currentPrize = usePrizeConfig().prizeConfig.currentPrize
      const data = state.personConfig.allPersonList.filter((item: IPersonConfig) => {
        // 如果该人员已经记录了当前奖项 id 且不是管理员预设(preset)，则视为已中过此奖，不再参与抽取
        // 若是 preset（由管理员内定），仍然允许参与抽取
        // 如果被排除（isExcluded），不能参与抽奖
        return (!item.prizeId.includes(currentPrize.id as string) || item.preset === true) && !item.isExcluded
      })

      return data
    },
    // 获取已中奖人员名单
    getAlreadyPersonList(state) {
      return state.personConfig.allPersonList.filter((item: IPersonConfig) => {
        return item.isWin === true
      })
    },
    // 获取中奖人员详情
    getAlreadyPersonDetail(state) {
      return state.personConfig.alreadyPersonList
    },
    // 获取未中奖人员名单（包括被管理员内定但仍应参与抽奖的人员）
    getNotPersonList(state) {
      return state.personConfig.allPersonList.filter((item: IPersonConfig) => {
        // 如果是管理员内定（preset），仍可参与抽奖
        // 如果被排除（isExcluded），不能参与抽奖
        return (item.isWin === false || item.preset === true) && !item.isExcluded
      })
    },
  },
  actions: {
    // 添加未中奖人员
    addNotPersonList(personList: IPersonConfig[]) {
      if (personList.length <= 0) {
        return
      }
      personList.forEach((item: IPersonConfig) => {
        this.personConfig.allPersonList.push(item)
      })
    },
    // 添加已中奖人员
    addAlreadyPersonList(personList: IPersonConfig[], prize: IPrizeConfig | null) {
      if (personList.length <= 0) {
        return
      }
      personList.forEach((person: IPersonConfig) => {
        this.personConfig.allPersonList.map((item: IPersonConfig) => {
          if (item.id === person.id && prize != null) {
            item.isWin = true
            // 如果尚未记录该奖项，则追加；否则只更新时间并清除 preset
            if (!item.prizeId.includes(prize.id as string)) {
              item.prizeName.push(prize.name)
              item.prizeTime.push(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
              item.prizeId.push(prize.id as string)
            }
            else {
              // 确保有时间戳
              if (!item.prizeTime || item.prizeTime.length === 0) {
                item.prizeTime.push(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
              }
            }
            // 如果这个人的中奖记录来自 admin 预设（preset），抽中后视为正式发放，清除 preset
            item.preset = false
          }

          return item
        })
        this.personConfig.alreadyPersonList.push(person)
      })
    },

    // 标记某个人为中奖，并以当前设置为准（覆盖以前的中奖信息）
    markPersonAsWinner(personId: number, prize: IPrizeConfig | null) {
      if (personId === undefined || personId == null || prize == null) {
        return
      }

      // 更新 allPersonList 中对应人员的信息，覆盖 prize 数组为当前奖项
      for (let i = 0; i < this.personConfig.allPersonList.length; i++) {
        const item = this.personConfig.allPersonList[i]
        if (item.id === personId) {
          item.isWin = true
          item.preset = true
          item.prizeName = [prize.name]
          item.prizeTime = [dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')]
          item.prizeId = [String(prize.id)]
          break
        }
      }

      // 在 alreadyPersonList 中替换或添加该人员，确保不重复
      this.personConfig.alreadyPersonList = this.personConfig.alreadyPersonList.filter((p: IPersonConfig) => p.id !== personId)
      const updated = this.personConfig.allPersonList.find((p: IPersonConfig) => p.id === personId)
      if (updated) {
        this.personConfig.alreadyPersonList.push(updated)
      }
    },

    // 标记某个人为不中奖，清除中奖信息
    markPersonAsNotWinner(personId: number) {
      if (personId === undefined || personId == null) {
        return
      }

      // 在 allPersonList 中重置该人员
      for (let i = 0; i < this.personConfig.allPersonList.length; i++) {
        if (this.personConfig.allPersonList[i].id === personId) {
          this.personConfig.allPersonList[i].isWin = false
          this.personConfig.allPersonList[i].prizeName = []
          this.personConfig.allPersonList[i].prizeTime = []
          this.personConfig.allPersonList[i].prizeId = []
          break
        }
      }

      // 从 alreadyPersonList 中移除
      this.personConfig.alreadyPersonList = this.personConfig.alreadyPersonList.filter((p: IPersonConfig) => p.id !== personId)
    },
    // 从已中奖移动到未中奖
    moveAlreadyToNot(person: IPersonConfig) {
      if (person.id === undefined || person.id == null) {
        return
      }
      const alreadyPersonListLength = this.personConfig.alreadyPersonList.length
      for (let i = 0; i < this.personConfig.allPersonList.length; i++) {
        if (person.id === this.personConfig.allPersonList[i].id) {
          this.personConfig.allPersonList[i].isWin = false
          this.personConfig.allPersonList[i].prizeName = []
          this.personConfig.allPersonList[i].prizeTime = []
          this.personConfig.allPersonList[i].prizeId = []

          break
        }
      }
      for (let i = 0; i < alreadyPersonListLength; i++) {
        this.personConfig.alreadyPersonList = this.personConfig.alreadyPersonList.filter((item: IPersonConfig) =>
          item.id !== person.id,
        )
      }
    },
    // 删除指定人员
    deletePerson(person: IPersonConfig) {
      if (person.id !== undefined || person.id != null) {
        this.personConfig.allPersonList = this.personConfig.allPersonList.filter((item: IPersonConfig) => item.id !== person.id)
        this.personConfig.alreadyPersonList = this.personConfig.alreadyPersonList.filter((item: IPersonConfig) => item.id !== person.id)
      }
    },
    // 删除所有人员
    deleteAllPerson() {
      this.personConfig.allPersonList = []
      this.personConfig.alreadyPersonList = []
    },

    // 删除所有人员
    resetPerson() {
      this.personConfig.allPersonList = []
      this.personConfig.alreadyPersonList = []
    },
    // 重置已中奖人员
    resetAlreadyPerson() {
      // 把已中奖人员合并到未中奖人员，要验证是否已存在
      this.personConfig.allPersonList.forEach((item: IPersonConfig) => {
        item.isWin = false
        item.prizeName = []
        item.prizeTime = []
        item.prizeId = []
      })
      this.personConfig.alreadyPersonList = []
    },
    setDefaultPersonList() {
      this.personConfig.allPersonList = defaultPersonList
      this.personConfig.alreadyPersonList = []
    },
    // 重置所有配置
    reset() {
      this.personConfig = {
        allPersonList: [] as IPersonConfig[],
        alreadyPersonList: [] as IPersonConfig[],
      }
    },
    // 切换人员排除状态
    toggleExcludePerson(personId: number, isExcluded: boolean, reason?: string) {
      const person = this.personConfig.allPersonList.find((p: IPersonConfig) => p.id === personId)
      if (person) {
        person.isExcluded = isExcluded
        person.excludeReason = reason || ''
        person.updateTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        // 如果要存储在localStorage中
        storage: localStorage,
        key: 'personConfig',
      },
    ],
  },
})
