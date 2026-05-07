<template>
  <section id="configurator" class="relative py-12 sm:py-16 md:py-24 lg:py-32" style="background-color: #0A0908;">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
      <!-- Section header -->
      <div class="text-center mb-8 sm:mb-10 md:mb-16">
        <p class="font-sans-en text-[9px] sm:text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 sm:mb-3 md:mb-4" style="color: #B87333;">Interactive Configurator</p>
        <h2 class="font-serif-cn text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide" style="color: #F5F0EB;">定制设计器</h2>
        <div class="mx-auto mt-3 sm:mt-4 md:mt-6" style="width: 40px; height: 1px; background-color: #B87333;" />
        <p class="mt-2 sm:mt-3 text-xs sm:text-sm" style="color: #8A8580;">调整参数，实时预览您的专属猫砂柜</p>
      </div>

      <!-- Stack on mobile, side-by-side on desktop -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
        <!-- Left: Controls -->
        <div class="md:col-span-5 lg:col-span-4">
          <ControlPanel
            :config="config"
            :total-price="totalPrice"
            :total-weight="totalWeight"
            @update="updateConfig"
          />
        </div>

        <!-- Right: 3D + Bill -->
        <div class="md:col-span-7 lg:col-span-8 space-y-4 sm:space-y-6">
          <ThreeViewer :config="config" />
          <BillTable :bill="bill" :total-price="totalPrice" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { DEFAULT_CONFIG, type CabinetConfig } from '../types/cabinet'
import { useBill, useTotalPrice, useTotalWeight } from '../composables/useBill'
import ControlPanel from '../components/ControlPanel.vue'
import ThreeViewer from '../components/ThreeViewer.vue'
import BillTable from '../components/BillTable.vue'

const config = reactive<CabinetConfig>({ ...DEFAULT_CONFIG })

const updateConfig = <K extends keyof CabinetConfig>(key: K, value: CabinetConfig[K]) => {
  (config as any)[key] = value
}

const bill = useBill(config)
const totalPrice = useTotalPrice(bill)
const totalWeight = useTotalWeight(config)
</script>
