<script setup lang='ts'>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  data: {
    type: Array as any,
    default: [] as any[],
  },
  tableColumns: {
    type: Array,
    default: [] as any[],
  },
})
const { t } = useI18n()
const dataColumns = computed<any[]>(() => {
  // 不带有actions的列
  const columns = props.tableColumns.filter((item: any) => !item.actions)

  return columns
})

const actionsColumns = computed<any[]>(() => {
  // 带有actions的列
  const columns = props.tableColumns.filter((item: any) => item.actions)

  return columns
})

// Sorting state
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

function getSortValue(value: any) {
  if (Array.isArray(value)) return value.join(',')
  if (value === undefined || value === null) return ''
  return String(value)
}

function toggleSort(columnKey: string) {
  if (!columnKey) return
  if (sortKey.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortKey.value = columnKey
    sortOrder.value = 'asc'
  }
}

const sortedData = computed(() => {
  if (!sortKey.value) return props.data || []
  const key = sortKey.value
  return [...(props.data || [])].slice().sort((a: any, b: any) => {
    const av = getSortValue(a[key])
    const bv = getSortValue(b[key])
    if (av < bv) return sortOrder.value === 'asc' ? -1 : 1
    if (av > bv) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="table min-w-[600px]">
      <!-- head -->
      <thead>
        <tr>
          <th />
          <th v-for="(item, index) in dataColumns" :key="index" :class="item.sort ? 'cursor-pointer select-none' : ''" @click="item.sort ? toggleSort(item.props) : null">
            {{ item.label }}
            <span v-if="item.sort">
              <span v-if="sortKey === item.props">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
            </span>
          </th>
          <th v-for="(item, index) in actionsColumns" :key="index">
            {{ t('table.operation') }}
          </th>
          <th />
        </tr>
      </thead>
      <tbody v-if="sortedData.length > 0">
        <!-- row  -->
        <tr v-for="item in sortedData" :key="item.id" class="hover">
          <th>{{ item.id }}</th>
          <td v-for="(column, index) in dataColumns" :key="index">
            <span v-if="column.formatValue" v-html="column.formatValue(item)"></span>
            <span v-else>{{ item[column.props] }}</span>
          </td>
          <!-- action -->
          <td v-for="(column, index) in actionsColumns" :key="index" class="flex gap-2">
            <template v-for="action in column.actions">
              <button
                v-if="!(action.hidden && action.hidden(item))"
                :key="action.name"
                class="btn btn-xs"
                :class="action.type"
                @click="action.onClick(item)"
              >
                {{ action.label }}
              </button>
            </template>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="text-center">
            {{ t('table.noneData') }}
          </td>
        </tr>
      </tbody>
      <!-- foot -->
    </table>
  </div>
</template>

<style lang='scss' scoped></style>
