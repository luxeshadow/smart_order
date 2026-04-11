<script setup lang="ts">
import { computed } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

type ChartItem = {
  name: string
  value: number
}

const data: ChartItem[] = [
  { name: 'Alibaba', value: 1970 },
  { name: 'Temu', value: 10 },
  { name: 'Costco', value: 1409 },
  { name: 'Amazon', value: 5050 },
  
]

// Paramètres du graphique
const width = 300
const height = 120
const padding = 20

// Points du graphique
const points = computed(() => {
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return data.map((d, i) => ({
    x:
      (i * (width - padding * 2)) / Math.max(data.length - 1, 1) +
      padding,
    y:
      height -
      ((d.value / maxVal) * (height - padding * 2) + padding)
  }))
})

// Courbe SVG smooth
const linePath = computed(() => {
  const pts = points.value

  if (pts.length < 2) return ''

  const first = pts[0]
  if (!first) return ''

  let path = `M ${first.x} ${first.y}`

  for (let i = 0; i < pts.length - 1; i++) {
    const current = pts[i]
    const next = pts[i + 1]

    if (!current || !next) continue

    const cp1x = (current.x + next.x) / 2

    path += ` C ${cp1x} ${current.y}, ${cp1x} ${next.y}, ${next.x} ${next.y}`
  }

  return path
})
</script>
<template>
  <div class="smart-chart-card">
    <div class="chart-header">
      <div class="header-left">
        <i class="fi fi-rr-stats"></i>
        <span class="chart-title">Market Analysis</span>
      </div>
      <span class="chart-subtitle">Live</span>
    </div>

    <div class="svg-container">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
        <line :x1="padding" :y1="padding" :x2="width-padding" :y2="padding" class="grid-line" />
        <line :x1="padding" :y1="height/2" :x2="width-padding" :y2="height/2" class="grid-line" />
        <line :x1="padding" :y1="height-padding" :x2="width-padding" :y2="height-padding" class="grid-line" />
        
        <path :d="linePath" class="main-line" />
        
        <g v-for="(p, i) in points" :key="i">
          <circle :cx="p.x" :cy="p.y" r="5" class="point-outer" />
          <circle :cx="p.x" :cy="p.y" r="2.5" class="point-inner" />
        </g>
      </svg>
    </div>

    <div class="chart-legend">
      <div v-for="item in data" :key="item.name" class="legend-item">
        <span class="legend-value">{{ item.value.toLocaleString() }}</span>
        <span class="legend-name">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-chart-card {
 
  margin-top: 25px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left i {
  color: v-bind('AppColor.primary.base');
  font-size: 16px;
}

.chart-title {
  font-weight: 800;
  font-size: 13px;
  color: #111;
  text-transform: uppercase;
}

.chart-subtitle {
  font-size: 10px;
  font-weight: 800;
  color: v-bind('AppColor.status.success');
  background: v-bind('AppColor.status.success + "15"');
  padding: 2px 8px;
  border-radius: 10px;
}

.svg-container {
  height: 140px;
  width: 100%;
}

svg { width: 100%; height: 100%; overflow: visible; }

.main-line {
  fill: none;
  stroke: v-bind('AppColor.primary.base');
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.grid-line { stroke: #f0f0f0; stroke-width: 1; stroke-dasharray: 4; }

.point-outer { fill: v-bind('AppColor.primary.base + "20"'); }
.point-inner { fill: v-bind('AppColor.primary.base'); stroke: white; stroke-width: 1.5; }

.chart-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f5f5f5;
}

.legend-item { text-align: center; }
.legend-value { display: block; font-weight: 800; font-size: 12px; color: #111; }
.legend-name { font-size: 9px; font-weight: 700; color: #999; text-transform: uppercase; }
</style>