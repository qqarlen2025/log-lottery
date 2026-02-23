<!-- eslint-disable vue/no-parsing-error -->
<script setup lang='ts'>
import type { IPersonConfig } from '@/types/storeType'
import DaiysuiTable from '@/components/DaiysuiTable/index.vue'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { addOtherInfo } from '@/utils'
import { readFileBinary } from '@/utils/file'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const personConfig = useStore().personConfig
const { getAllPersonList: allPersonList, getAlreadyPersonList: alreadyPersonList } = storeToRefs(personConfig)
const limitType = '.xlsx,.xls'
// const personList = ref<any[]>([])

const prizeConfig = useStore().prizeConfig
const { getPrizeConfig: prizeList } = storeToRefs(prizeConfig)

const setWinnerDialog = ref()
const selectedPerson = ref<IPersonConfig | null>(null)
const selectedPrizeId = ref('')

function handleSetAsWinner(row: IPersonConfig) {
  selectedPerson.value = row
  selectedPrizeId.value = prizeList.value && prizeList.value.length > 0 ? String(prizeList.value[0].id) : ''
  // Template refs are stored in `.value` when accessed in script setup
  if (setWinnerDialog && setWinnerDialog.value && (setWinnerDialog.value as any).showModal) {
    ;(setWinnerDialog.value as any).showModal()
  }
}

function confirmSetAsWinner() {
  if (!selectedPerson.value) {
    return
  }
  const prize = (prizeList.value || []).find((p: any) => p.id === selectedPrizeId.value)
  if (!prize) {
    // eslint-disable-next-line no-alert
    alert(i18n.global.t('error.completeInformation'))
    return
  }

  // Use the centralized store action to mark the person as winner (overwrite previous prize info)
  personConfig.markPersonAsWinner(selectedPerson.value.id, prize)

  // close the dialog
  if (setWinnerDialog && setWinnerDialog.value && (setWinnerDialog.value as any).close) {
    ;(setWinnerDialog.value as any).close()
  }
  // reset selection
  selectedPerson.value = null
  selectedPrizeId.value = ''
}

const resetDataDialog = ref()
const delAllDataDialog = ref()

async function handleFileChange(e: Event) {
  const dataBinary = await readFileBinary(((e.target as HTMLInputElement).files as FileList)[0]!)
  const workBook = XLSX.read(dataBinary, { type: 'binary', cellDates: true })
  const workSheet = workBook.Sheets[workBook.SheetNames[0]]
  const excelData = XLSX.utils.sheet_to_json(workSheet)
  const allData = addOtherInfo(excelData)
  personConfig.resetPerson()
  personConfig.addNotPersonList(allData)

  // 把导入时已标记为中奖的人员移动到已中奖名单，方便在界面中查看/管理
  const winners = allData.filter((p: any) => p.isWin === true)
  if (winners.length > 0) {
    winners.forEach((p: any) => {
      personConfig.personConfig.alreadyPersonList.push(p)
    })
  }
}
function exportData() {
  let data = JSON.parse(JSON.stringify(allPersonList.value))
  // 排除一些字段
  for (let i = 0; i < data.length; i++) {
    delete data[i].x
    delete data[i].y
    delete data[i].id
    delete data[i].createTime
    delete data[i].updateTime
    // 保留 prizeId 以便导出后可再导入作为预设中奖信息
    // 修改字段名称
    if (data[i].isWin) {
      data[i].isWin = i18n.global.t('data.yes')
    }
    else {
      data[i].isWin = i18n.global.t('data.no')
    }
    // 格式化排除状态
    if (data[i].isExcluded) {
      data[i].isExcluded = i18n.global.t('data.yes')
    }
    else {
      data[i].isExcluded = i18n.global.t('data.no')
    }
    // 格式化数组为字符串，方便导出到Excel并可导回
    data[i].prizeTime = data[i].prizeTime.join(',')
    data[i].prizeName = data[i].prizeName.join(',')
    data[i].prizeId = data[i].prizeId.join(',')
  }
  let dataString = JSON.stringify(data)
  dataString = dataString
    .replaceAll(/uid/g, i18n.global.t('data.number'))
    .replaceAll(/isWin/g, i18n.global.t('data.isWin'))
    .replaceAll(/isExcluded/g, i18n.global.t('data.excludeStatus'))
    .replaceAll(/department/g, i18n.global.t('data.department'))
    .replaceAll(/name/g, i18n.global.t('data.name'))
    .replaceAll(/identity/g, i18n.global.t('data.identity'))
    .replaceAll(/prizeName/g, i18n.global.t('data.prizeName'))
    .replaceAll(/prizeTime/g, i18n.global.t('data.prizeTime'))

  data = JSON.parse(dataString)

  if (data.length > 0) {
    const dataBinary = XLSX.utils.json_to_sheet(data)
    const dataBinaryBinary = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(dataBinaryBinary, dataBinary, 'Sheet1')
    XLSX.writeFile(dataBinaryBinary, 'data.xlsx')
  }
}

function resetData() {
  personConfig.resetAlreadyPerson()
}

function deleteAll() {
  personConfig.deleteAllPerson()
}

function delPersonItem(row: IPersonConfig) {
  personConfig.deletePerson(row)
}

const tableColumns = [
  {
    label: i18n.global.t('data.number'),
    props: 'uid',
  },
  {
    label: i18n.global.t('data.name'),
    props: 'name',
  },
  {
    label: i18n.global.t('data.department'),
    props: 'department',
  },
  {
    label: i18n.global.t('data.avatar'),
    props: 'avatar',
    formatValue(row: any) {
       return row.avatar ? `<img src="${row.avatar}" alt="avatar" style="width: 50px; height: 50px;"/>` : '-';
    }
  },
  {
    label: i18n.global.t('data.identity'),
    props: 'identity',
  },
  {
    label: i18n.global.t('data.prizeName'),
    props: 'prizeName',
    sort: true,
    formatValue(row: IPersonConfig) {
      const prizes = Array.isArray(row.prizeName) ? row.prizeName.join(', ') : (row.prizeName || '')
      const safe = String(prizes).replace(/"/g, '&quot;')
      const display = prizes.length > 30 ? `${prizes.slice(0, 30)}...` : prizes

      // 如果是管理员预设（preset），在显示前加上黄色内定 Badge
      const badge = row.preset ? `<span style="display:inline-block; background:#FFEC99; color:#222; padding:2px 6px; border-radius:6px; margin-right:8px; font-size:12px;">内定</span>` : ''

      return `${badge}<span title="${safe}" style="display:inline-block; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${display}</span>`
    },
  },
  {
    label: i18n.global.t('data.isWin'),
    props: 'isWin',
    formatValue(row: IPersonConfig) {
      if (row.isWin) {
        const prizes = Array.isArray(row.prizeName) ? row.prizeName.join(', ') : (row.prizeName || '')
        return `${i18n.global.t('data.yes')} ${prizes ? '- ' + prizes : ''}`
      }

      return i18n.global.t('data.no')
    },
  },
  {
    label: i18n.global.t('data.excludeStatus'),
    props: 'isExcluded',
    formatValue(row: IPersonConfig) {
      if (row.isExcluded) {
        return `<span style="color:red;">${i18n.global.t('data.excluded')}</span>`
      }
      return i18n.global.t('data.notExcluded')
    },
  },

  {
    label: i18n.global.t('data.operation'),
    actions: [
      {
        label: i18n.global.t('data.setAsWinner'),
        type: 'btn-success',
        hidden: (row: IPersonConfig) => !!row.isWin,
        onClick: (row: IPersonConfig) => {
          handleSetAsWinner(row)
        },
      },
      {
        label: i18n.global.t('data.setAsNotWinner'),
        type: 'btn-warning',
        hidden: (row: IPersonConfig) => !row.isWin,
        onClick: (row: IPersonConfig) => {
          // call store action
          const prizeConfig = useStore().personConfig
          prizeConfig.markPersonAsNotWinner(row.id)
        },
      },
      {
        label: (row: IPersonConfig) => row.isExcluded ? i18n.global.t('data.cancelExclude') : i18n.global.t('data.excludePerson'),
        type: (row: IPersonConfig) => row.isExcluded ? 'btn-success' : 'btn-warning',
        hidden: (row: IPersonConfig) => !!row.isWin, // 已中奖人员不显示此按钮
        onClick: (row: IPersonConfig) => {
          if (row.isExcluded) {
            // 取消排除
            personConfig.toggleExcludePerson(row.id, false)
          } else {
            // 设置排除
            personConfig.toggleExcludePerson(row.id, true, '手动排除')
          }
        },
      },
      {
        label: i18n.global.t('data.delete'),
        type: 'btn-error',
        onClick: (row: IPersonConfig) => {
          delPersonItem(row)
        },
      },

    ],
  },
]
onMounted(() => {
})
</script>

<template>
  <dialog id="my_modal_1" ref="resetDataDialog" class="border-none modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">
        {{ t('dialog.titleTip') }}
      </h3>
      <p class="py-4">
        {{ t('dialog.dialogResetWinner') }}
      </p>
      <div class="modal-action">
        <form method="dialog" class="flex gap-3">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn" @click="resetDataDialog.close()">
            {{ t('button.cancel') }}
          </button>
          <button class="btn" @click="resetData">
            {{ t('button.confirm') }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
  <dialog id="my_modal_1" ref="delAllDataDialog" class="border-none modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">
        {{ t('dialog.titleTip') }}
      </h3>
      <p class="py-4">
        {{ t('dialog.dialogDelAllPerson') }}
      </p>
      <div class="modal-action">
        <form method="dialog" class="flex gap-3">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn" @click="delAllDataDialog.close()">
            {{ t('button.cancel') }}
          </button>
          <button class="btn" @click="deleteAll">
            {{ t('button.confirm') }}
          </button>
        </form>
      </div>
    </div>
  </dialog>

  <dialog id="set_winner_dialog" ref="setWinnerDialog" class="border-none modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">
        {{ t('dialog.titleTip') }}
      </h3>
      <div class="py-2">
        <label class="flex items-center gap-2">
          <span class="label-text">{{ t('data.prizeName') }}:</span>
          <select v-model="selectedPrizeId" class="select select-bordered">
            <option v-for="p in prizeList" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </label>
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-3">
          <button class="btn" @click="setWinnerDialog.close()">{{ t('button.cancel') }}</button>
          <button class="btn" @click="confirmSetAsWinner()">{{ t('button.confirm') }}</button>
        </form>
      </div>
    </div>
  </dialog>
  <div class="min-w-1000px">
    <h2>{{ t('viewTitle.personManagement') }}</h2>
    <div class="flex gap-3">
      <button class="btn btn-error btn-sm" @click="delAllDataDialog.showModal()">
        {{ t('button.allDelete') }}
      </button>
      <div class="tooltip tooltip-bottom" :data-tip="t('tooltip.downloadTemplateTip')">
        <a
          class="no-underline btn btn-secondary btn-sm" :download="t('data.xlsxName')" target="_blank"
          :href="`/log-lottery/${t('data.xlsxName')}`"
        >{{ t('button.downloadTemplate') }}</a>
      </div>
      <div class="">
        <label for="explore">

          <div class="tooltip tooltip-bottom" :data-tip="t('tooltip.uploadExcelTip')">
            <input
              id="explore" type="file" class="" style="display: none" :accept="limitType"
              @change="handleFileChange"
            >

            <span class="btn btn-primary btn-sm">{{ t('button.importData') }}</span>
          </div>
        </label>
      </div>
      <button class="btn btn-error btn-sm" @click="resetDataDialog.showModal()">
        {{ t('button.resetData') }}
      </button>
      <button class="btn btn-accent btn-sm" @click="exportData">
        {{ t('button.exportResult') }}
      </button>
      <div>
        <span>{{ t('table.luckyPeopleNumber') }}:</span>
        <span>{{ alreadyPersonList.length }}</span>
        <span>&nbsp;/&nbsp;</span>
        <span>{{ allPersonList.length }}</span>
      </div>
    </div>
    <DaiysuiTable :table-columns="tableColumns" :data="allPersonList" />
  </div>
</template>

<style lang='scss' scoped></style>
