import dayjs from 'dayjs'
// 筛选人员数据
export function filterData(tableData: any[], localRowCount: number) {
  const dataLength = tableData.length
  let j = 0
  for (let i = 0; i < dataLength; i++) {
    if (i % localRowCount === 0) {
      j++
    }
    tableData[i].x = i % localRowCount + 1
    tableData[i].y = j
    tableData[i].id = i
    // 是否中奖
  }

  return tableData
}

export function addOtherInfo(personList: any[]) {
  const len = personList.length
  for (let i = 0; i < len; i++) {
    personList[i].id = i
    personList[i].createTime = personList[i].createTime || dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    personList[i].updateTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')

    // Helper to normalize values into string arrays
    const normalizeToArray = (val: any) => {
      if (Array.isArray(val)) return val
      if (val === undefined || val === null || val === '') return []
      if (typeof val === 'string') return val.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
      return [String(val)]
    }

    personList[i].prizeName = normalizeToArray(personList[i].prizeName)
    personList[i].prizeTime = normalizeToArray(personList[i].prizeTime)
    personList[i].prizeId = normalizeToArray(personList[i].prizeId)

    // Normalize isWin: accept boolean or common string values
    const rawIsWin = personList[i].isWin
    const isWin = rawIsWin === true || (typeof rawIsWin === 'string' && ['yes', 'true', '是', '1'].includes(rawIsWin.toLowerCase()))
    personList[i].isWin = !!isWin

    // preset 默认为 false（导入时不会默认变成内定）
    personList[i].preset = personList[i].preset === true

    // If marked as winner but no prizeTime provided, set current timestamp
    if (personList[i].isWin && personList[i].prizeTime.length === 0) {
      personList[i].prizeTime.push(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
    }
  }

  return personList
}

export function selectCard(cardIndexArr: number[], tableLength: number, personId: number): number {
  const cardIndex = Math.floor(Math.random() * (tableLength - 1))
  if (cardIndexArr.includes(cardIndex)) {
    return selectCard(cardIndexArr, tableLength, personId)
  }

  return cardIndex
}

export function themeChange(theme: string) {
  // 获取根html
  const html = document.querySelectorAll('html')
  if (html) {
    html[0].setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }
}
