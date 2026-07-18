<template>
  <svg v-if="brandPath" class="site-icon brand-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path :d="brandPath" fill="currentColor" />
  </svg>
  <component v-else :is="icon" class="site-icon" aria-hidden="true" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  Home,
  Lightbulb,
  CircleHelp,
  Info,
  Music,
  BookOpen,
  Signpost,
  Terminal,
  Shield,
  Settings
} from '@lucide/vue'
import { siDiscord, siQq, siWechat } from 'simple-icons'

const props = defineProps<{
  name: string
}>()

const iconMap: Record<string, typeof Home> = {
  home: Home,
  lightbulb: Lightbulb,
  'circle-help': CircleHelp,
  'circle-info': Info,
  music: Music,
  'book-open': BookOpen,
  signpost: Signpost,
  terminal: Terminal,
  shield: Shield,
  settings: Settings
}

// 品牌图标为纯色 SVG 路径，fill=currentColor，随文字颜色自动适配深色模式
const brandIconMap: Record<string, string> = {
  qq: siQq.path,
  wechat: siWechat.path,
  discord: siDiscord.path
}

const brandPath = computed(() => brandIconMap[props.name])
const icon = computed(() => iconMap[props.name] || Home)
</script>

<style scoped>
.site-icon {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
