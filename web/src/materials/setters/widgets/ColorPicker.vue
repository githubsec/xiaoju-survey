<template>
  <el-form-item class="pick-wrap">
    <el-color-picker
      :modelValue="colorValue"
      @change="handleColorPickerChange"
    ></el-color-picker>
  </el-form-item>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { FORM_CHANGE_EVENT_KEY } from '@/materials/setters/constant'

interface Props {
  formConfig: any
}

interface Emit {
  (ev: typeof FORM_CHANGE_EVENT_KEY, arg: { key: string; value: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

// 如果 value 为空，使用默认主题色 #004EA1
const colorValue = computed(() => {
  const value = props.formConfig.value || '#004EA1'
  console.log('[ColorPicker] formConfig.key:', props.formConfig.key, 'value:', props.formConfig.value, 'final:', value)
  return value
})

// 监听 formConfig 变化
watch(() => props.formConfig, (newVal) => {
  console.log('[ColorPicker] formConfig changed:', newVal)
}, { deep: true, immediate: true })

const handleColorPickerChange = (value: string) => {
  const key = props.formConfig.key
  console.log('[ColorPicker] color changed:', key, value)
  emit(FORM_CHANGE_EVENT_KEY, { key, value })
}
</script>
<style lang="scss" scoped>
.pick-wrap {
  width: 100%;

  :deep(.el-form-item__content) {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
