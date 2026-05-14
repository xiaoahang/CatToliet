<template>
  <!-- 材料清单组件  -->
  <div class="rounded-lg overflow-hidden" style="background-color: rgba(245,240,235,0.02); border: 1px solid rgba(245,240,235,0.06);">
    <!-- Header bar -->
    <button @click="show = !show" class="w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 transition-colors duration-300 hover:bg-[rgba(245,240,235,0.03)]">
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <svg width="18" height="18" class="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="#B87333" stroke-width="1.5">
          <path d="M3 4h14M3 8h14M3 12h10M3 16h7" />
        </svg>
        <span class="font-serif-cn text-sm font-semibold truncate" style="color: #F5F0EB;">材料清单</span>
        <span class="text-[10px] sm:text-xs font-sans-en px-1.5 sm:px-2 py-0.5 rounded shrink-0" style="background-color: rgba(184,115,51,0.15); color: #B87333;">
          {{ bill.length }} 项
        </span>
      </div>
      <svg width="14" height="14" class="sm:w-4 sm:h-4 shrink-0 ml-2" viewBox="0 0 16 16" fill="none" stroke="#8A8580" stroke-width="1.5" :style="{ transform: show ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }">
        <path d="M4 6l4 4 4-4" />
      </svg>
    </button>

    <!-- Table content -->
    <div :style="{ height: show ? 'auto' : '0', opacity: show ? 1 : 0, overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }">
      <div class="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 overflow-x-auto -mx-0">
        <table class="w-full" style="min-width: 580px;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(245,240,235,0.08);">
              <th v-for="h in TABLE_HEADERS" :key="h.key" class="py-2 sm:py-3 text-[9px] sm:text-[10px] md:text-[11px] font-sans-en font-medium tracking-wider whitespace-nowrap" :class="h.align" :style="{ color: '#8A8580' }">
                {{ h.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in bill" :key="i" style="border-bottom: 1px solid rgba(245,240,235,0.04);" class="hover:bg-[rgba(245,240,235,0.02)] transition-colors duration-200">
              <td class="py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs whitespace-nowrap" style="color: #F5F0EB;">{{ item.name }}</td>
              <td class="py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs" style="color: #8A8580;">{{ item.spec }}</td>
              <td class="py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs" style="color: #B87333;">{{ item.position }}</td>
              <td class="py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs text-center font-sans-en" style="color: #F5F0EB;">{{ item.count }}</td>
              <td class="py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs text-right font-sans-en" style="color: #8A8580;">¥{{ item.unitPrice.toFixed(2) }}</td>
              <td class="py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs text-right font-sans-en font-semibold" style="color: #B87333;">¥{{ item.total.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" />
              <td class="py-2.5 sm:py-3 md:py-4 text-[10px] sm:text-xs font-serif-cn font-semibold text-right" style="color: #F5F0EB;">合计</td>
              <td class="py-2.5 sm:py-3 md:py-4 text-base sm:text-lg font-sans-en font-bold text-right" style="color: #B87333;">¥{{ totalPrice.toFixed(2) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Action buttons -->
      <div class="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button class="flex-1 py-2.5 sm:py-3 text-xs font-sans-en font-medium rounded transition-all duration-300 hover:scale-[1.02] active:scale-95" style="background-color: #B87333; color: #F5F0EB;" @click="copy">复制清单</button>
          <button class="flex-1 py-2.5 sm:py-3 text-xs font-sans-en font-medium rounded transition-all duration-300 hover:scale-[1.02] active:scale-95" style="background-color: transparent; border: 1px solid rgba(245,240,235,0.15); color: #F5F0EB;" @click="exportCSV">导出 CSV</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MaterialItem } from '../types/cabinet'
import { TABLE_HEADERS } from '../config/ui'

const props = defineProps<{
  bill: MaterialItem[]
  totalPrice: number
}>()

const show = ref(true)

function copy() {
  const content = props.bill
    .map((i) => `${i.name}\t${i.spec}\t${i.position}\t${i.count}\t¥${i.unitPrice.toFixed(2)}\t¥${i.total.toFixed(2)}`)
    .join('\n')
  navigator.clipboard.writeText(`猫砂柜材料清单\n\n${content}\n合计\t\t\t\t\t¥${props.totalPrice.toFixed(2)}`)
  alert('材料清单已复制到剪贴板')
}

function exportCSV() {
  const csv = [
    ['材料名称', '规格', '用途/位置', '数量', '单价', '小计'],
    ...props.bill.map((i) => [i.name, i.spec, i.position, String(i.count), `¥${i.unitPrice.toFixed(2)}`, `¥${i.total.toFixed(2)}`]),
    ['合计', '', '', '', '', `¥${props.totalPrice.toFixed(2)}`],
  ]
    .map((r) => r.join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '猫砂柜材料清单.csv'
  link.click()
}
</script>
