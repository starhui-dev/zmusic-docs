<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Download, UserPlus, X } from '@lucide/vue'
import { siQq, siWechat } from 'simple-icons'

type GroupType = 'qq' | 'wechat'

const QQ_GROUP_LINK = 'https://qm.qq.com/q/buxuatfTCo'

const GROUP_TABS: { type: GroupType; label: string; icon: typeof siQq }[] = [
  { type: 'qq', label: 'QQ 群', icon: siQq },
  { type: 'wechat', label: '微信群', icon: siWechat }
]

const dialog = ref<HTMLDialogElement>()
const groupType = ref<GroupType>('wechat')

const isQqGroup = computed(() => groupType.value === 'qq')
const qrCodeSrc = computed(() =>
  isQqGroup.value ? '/images/qq-group.png' : '/images/wechat-group.png'
)
const qrCodeAlt = computed(() =>
  isQqGroup.value ? 'ZMusic QQ 群二维码' : 'ZMusic 用户交流群二维码'
)
const dialogLabel = computed(() =>
  isQqGroup.value ? 'ZMusic QQ 群' : 'ZMusic 用户交流群'
)
const brandIcon = computed(() => (isQqGroup.value ? siQq : siWechat))
const brandColor = computed(() => `#${brandIcon.value.hex}`)

function openDialog(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const link = target.closest<HTMLAnchorElement>(
    'a[href="#qq-group"], a[href="#wechat-group"]'
  )
  if (!link) return

  event.preventDefault()
  groupType.value = link.getAttribute('href') === '#qq-group' ? 'qq' : 'wechat'
  dialog.value?.showModal()
}

function closeDialog() {
  dialog.value?.close()
}

function closeFromBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) closeDialog()
}

async function saveGroupCard() {
  const qrImage = new Image()
  qrImage.src = qrCodeSrc.value
  await qrImage.decode()

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1164

  const context = canvas.getContext('2d')
  if (!context) return

  context.fillStyle = '#111827'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.strokeStyle = '#334155'
  context.lineWidth = 4
  context.beginPath()
  context.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 24)
  context.stroke()

  context.textAlign = 'center'
  context.fillStyle = '#f4f4f5'
  context.font = '600 54px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  context.fillText(dialogLabel.value, canvas.width / 2, 122)

  context.fillStyle = '#a1a1aa'
  context.font = '38px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  const hint = isQqGroup.value
    ? '使用手机 QQ 扫码加入群聊'
    : '使用微信或企业微信扫码加入群聊'
  context.fillText(hint, canvas.width / 2, 202)

  context.save()
  context.beginPath()
  context.roundRect(144, 276, 792, 792, 20)
  context.clip()
  context.imageSmoothingEnabled = false
  context.drawImage(qrImage, 144, 276, 792, 792)
  context.restore()

  context.fillStyle = '#fff'
  context.beginPath()
  context.roundRect(452, 584, 176, 176, 24)
  context.fill()

  context.save()
  context.translate(488, 620)
  context.scale(104 / 24, 104 / 24)
  context.fillStyle = brandColor.value
  context.fill(new Path2D(brandIcon.value.path))
  context.restore()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `ZMusic-${isQqGroup.value ? 'QQ群' : '用户交流群'}.png`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}

onMounted(() => document.addEventListener('click', openDialog))
onBeforeUnmount(() => document.removeEventListener('click', openDialog))
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="group-dialog"
      :style="{ '--group-brand': brandColor }"
      :aria-label="dialogLabel"
      @click="closeFromBackdrop"
    >
      <div class="dialog-content">
        <button class="close-button" type="button" aria-label="关闭" @click="closeDialog">
          <X aria-hidden="true" />
        </button>

        <h2>ZMusic 用户交流群</h2>

        <div class="group-tabs">
          <button
            v-for="tab in GROUP_TABS"
            :key="tab.type"
            type="button"
            class="group-tab"
            :class="{ active: groupType === tab.type }"
            :aria-pressed="groupType === tab.type"
            @click="groupType = tab.type"
          >
            <svg
              viewBox="0 0 24 24"
              :style="{ color: `#${tab.icon.hex}` }"
              aria-hidden="true"
            >
              <path :d="tab.icon.path" fill="currentColor" />
            </svg>
            {{ tab.label }}
          </button>
        </div>

        <template v-if="isQqGroup">
          <p class="desktop-hint">使用手机 QQ 扫码，或点击下方按钮加入群聊</p>
          <p class="mobile-hint">保存图片后，使用手机 QQ 识别二维码加群</p>
        </template>
        <template v-else>
          <p class="desktop-hint">使用微信或企业微信扫码加入群聊</p>
          <p class="mobile-hint">保存图片后，使用微信或企业微信识别二维码</p>
        </template>

        <div class="qr-wrap">
          <div class="qr-card">
            <img :src="qrCodeSrc" :alt="qrCodeAlt" />
            <span class="qr-brand" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path :d="brandIcon.path" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>

        <div class="dialog-actions">
          <a
            v-if="isQqGroup"
            class="action-button"
            :href="QQ_GROUP_LINK"
            target="_blank"
            rel="noreferrer"
            @click="closeDialog"
          >
            <UserPlus aria-hidden="true" />
            点击加群
          </a>
          <button
            class="action-button save-image-button"
            :class="{ secondary: isQqGroup }"
            type="button"
            @click="saveGroupCard"
          >
            <Download aria-hidden="true" />
            保存图片
          </button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.group-dialog {
  width: min(340px, calc(100vw - 32px));
  margin: auto;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  color: var(--vp-c-text-1);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
}

.group-dialog::backdrop {
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 深色模式跟随全局 html.dark，不绑定 isDark——水合时属性不匹配不会被补丁，绑定会卡在 SSR 状态 */
.dark .group-dialog {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(17, 24, 39, 0.82);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

.group-dialog[open] {
  animation: dialog-pop 0.32s cubic-bezier(0.33, 1, 0.68, 1);
}

.group-dialog[open]::backdrop {
  animation: backdrop-fade 0.24s ease-out;
}

@keyframes dialog-pop {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.95);
  }
}

@keyframes backdrop-fade {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .group-dialog[open],
  .group-dialog[open]::backdrop {
    animation: none;
  }
}

.dialog-content {
  position: relative;
  overflow: hidden;
  padding: 26px 22px 22px;
  border-radius: inherit;
  text-align: center;
}

/* 顶部品牌色柔光，与整站的渐变光晕风格保持一致 */
.dialog-content::before {
  position: absolute;
  top: -120px;
  left: 50%;
  width: 280px;
  height: 200px;
  content: '';
  pointer-events: none;
  background: radial-gradient(closest-side, var(--group-brand), transparent);
  opacity: 0.16;
  transform: translateX(-50%);
}

.dark .dialog-content::before {
  opacity: 0.22;
}

.close-button {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.close-button:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.close-button:focus-visible {
  outline: 2px solid var(--group-brand);
  outline-offset: 2px;
}

.close-button svg {
  width: 17px;
  height: 17px;
}

h2 {
  margin: 0 26px;
  border: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 26px;
}

.group-tabs {
  display: flex;
  gap: 4px;
  margin: 12px 26px 0;
  padding: 4px;
  border-radius: 12px;
  background: var(--vp-c-default-soft);
}

.group-tab {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border: 0;
  border-radius: 9px;
  color: var(--vp-c-text-2);
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
}

.group-tab svg {
  width: 16px;
  height: 16px;
}

.group-tab.active {
  color: var(--vp-c-text-1);
  background: #fff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
}

.dark .group-tab.active {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.group-tab:focus-visible {
  outline: 2px solid var(--group-brand);
  outline-offset: 2px;
}

p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 20px;
}

.mobile-hint {
  display: none;
}

.qr-wrap {
  position: relative;
  width: min(100%, 252px);
  margin: 18px auto;
}

/* 二维码背后的品牌色光晕 */
.qr-wrap::before {
  position: absolute;
  inset: -22px;
  content: '';
  pointer-events: none;
  background: radial-gradient(circle, var(--group-brand), transparent 68%);
  filter: blur(18px);
  opacity: 0.18;
}

.dark .qr-wrap::before {
  opacity: 0.26;
}

.qr-card {
  position: relative;
  overflow: hidden;
  padding: 6px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 12px 32px rgba(15, 23, 42, 0.12);
}

.qr-card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.qr-brand {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 13px;
  color: var(--group-brand);
  background: #fff;
  box-shadow:
    0 0 0 5px #fff,
    0 2px 10px rgba(15, 23, 42, 0.14);
  transform: translate(-50%, -50%);
}

.qr-brand svg {
  width: 30px;
  height: 30px;
}

.dialog-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  min-height: 42px;
  padding: 9px 16px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: var(--group-brand);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    filter 0.2s,
    box-shadow 0.2s,
    transform 0.1s;
}

.action-button:hover {
  color: #fff;
  filter: brightness(1.1);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
}

.action-button:active {
  transform: translateY(1px);
}

.action-button:focus-visible {
  outline: 2px solid var(--group-brand);
  outline-offset: 2px;
}

.action-button.secondary {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
  box-shadow: none;
}

.action-button.secondary:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-2);
  filter: none;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

/* 保存图片按钮仅移动端显示 */
.save-image-button {
  display: none;
}

@media (max-width: 420px) {
  .dialog-content {
    padding: 24px 18px 18px;
  }
}

@media (max-width: 767px) {
  .desktop-hint {
    display: none;
  }

  .mobile-hint {
    display: block;
  }

  .save-image-button {
    display: flex;
  }
}
</style>
