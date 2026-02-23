export interface IPersonConfig {
    id: number;
    uid: string;
    name: string;
    department: string;
    identity: string;
    avatar: string;
    isWin: boolean;
    // 如果是由管理员"设为中奖"（内定），标记为 preset，抽奖时可以作为候选抽到，抽中后会被清除
    preset?: boolean;
    // 标记是否被排除（不参与抽奖）
    isExcluded?: boolean;
    // 排除原因（可选）
    excludeReason?: string;
    x: number;
    y: number
    createTime: string;
    updateTime: string;
    prizeName: string[];
    prizeId: string[];
    prizeTime: string[];
}
export interface Separate {
  id: string
  count: number
  isUsedCount: number
}
export interface IPrizeConfig {
  id: number | string
  name: string
  sort: number
  isAll: boolean
  count: number
  isUsedCount: number
  picture: {
    id: string | number
    name: string
    url: string
  }
  separateCount: {
    enable: boolean
    countList: Separate[]
  }
  desc: string
  isShow: boolean
  isUsed: boolean
  frequency: number
}
export interface IMusic {
  id: string
  name: string
  url: string
}

export interface IImage {
  id: string
  name: string
  url: string
}
