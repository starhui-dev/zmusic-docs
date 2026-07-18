<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Download, X } from '@lucide/vue'
import { useData } from 'vitepress'

const dialog = ref<HTMLDialogElement>()
const { isDark } = useData()

function openDialog(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element) || !target.closest('a[href="#wechat-group"]')) return

  event.preventDefault()
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
  qrImage.src = '/images/wechat-group.png'
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
  context.fillText('ZMusic 用户交流群', canvas.width / 2, 122)

  context.fillStyle = '#a1a1aa'
  context.font = '38px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  context.fillText('使用微信或企业微信扫码加入群聊', canvas.width / 2, 202)

  context.save()
  context.beginPath()
  context.roundRect(144, 276, 792, 792, 20)
  context.clip()
  context.imageSmoothingEnabled = false
  context.drawImage(qrImage, 144, 276, 792, 792)
  context.restore()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = 'ZMusic-用户交流群.png'
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
      class="wechat-group-dialog"
      :class="{ dark: isDark }"
      @click="closeFromBackdrop"
    >
      <div class="dialog-content">
        <button class="close-button" type="button" aria-label="关闭" @click="closeDialog">
          <X aria-hidden="true" />
        </button>

        <h2>ZMusic 用户交流群</h2>
        <p class="desktop-hint">使用微信或企业微信扫码加入群聊</p>
        <p class="mobile-hint">保存图片后，使用微信或企业微信识别二维码</p>

        <div class="qr-code">
          <img
            src="/images/wechat-group.png"
            alt="ZMusic 用户交流群二维码"
            width="396"
            height="396"
          />
        </div>

        <button class="save-image-button" type="button" @click="saveGroupCard">
          <Download aria-hidden="true" />
          保存图片
        </button>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.wechat-group-dialog {
  width: min(360px, calc(100vw - 32px));
  margin: auto;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--vp-shadow-5);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
}

.wechat-group-dialog::backdrop {
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.wechat-group-dialog.dark {
  border-color: rgba(148, 163, 184, 0.24);
  background: rgba(17, 24, 39, 0.82);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.48);
}

.dialog-content {
  position: relative;
  padding: 24px;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 6px;
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
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.close-button svg {
  width: 18px;
  height: 18px;
}

h2 {
  margin: 0;
  padding: 0 32px;
  border: 0;
  font-size: 18px;
  line-height: 28px;
}

p {
  margin: 6px 0 18px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 22px;
}

.mobile-hint,
.save-image-button {
  display: none;
}

.qr-code {
  width: min(100%, 264px);
  margin: 0 auto;
  overflow: hidden;
  padding: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #fff;
}

.qr-code img {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 420px) {
  .dialog-content {
    padding: 22px 18px 18px;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    margin-top: 14px;
    padding: 7px 14px;
    border: 1px solid var(--vp-c-brand-1);
    border-radius: 6px;
    color: #fff;
    background: var(--vp-c-brand-1);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-image-button:hover {
    background: var(--vp-c-brand-2);
  }

  .save-image-button:focus-visible {
    outline: 2px solid var(--vp-c-brand-1);
    outline-offset: 2px;
  }

  .save-image-button svg {
    width: 16px;
    height: 16px;
  }
}
</style>
