<template>
  <div class="allow-ips-manager">
    <!-- IP輸入列表 -->
    <div v-for="(ip, index) in ipList" :key="index" class="ip-input-row">
      <el-input
        v-model="ipList[index]"
        placeholder="請輸入IP地址（例：192.168.1.1）"
        @input="validateIP(index)"
        @blur="removeEmptyIPs"
        style="flex: 1;"
      />
      <el-button 
        type="danger" 
        icon="Minus" 
        size="small" 
        @click="removeIP(index)"
        :disabled="ipList.length === 1"
        style="margin-left: 8px;"
      />
    </div>
    
    <!-- 新增按鈕 -->
    <el-button 
      type="primary" 
      icon="Plus" 
      size="small" 
      @click="addIP" 
      style="margin-top: 8px;"
    >
      新增IP
    </el-button>
    
    <!-- 驗證錯誤提示 -->
    <div v-if="hasInvalidIP" class="error-message">
      ※ 請輸入有效的IP地址格式
    </div>
    
    <!-- 預覽區域 -->
    <div v-if="modelValue" class="preview-area">
      <div class="preview-label">目前設定的IP白名單：</div>
      <div class="preview-content">{{ modelValue }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update:modelValue']);

// 將逗號分隔的字串轉換為陣列
const ipList = ref([]);
const hasInvalidIP = ref(false);

// 初始化IP列表
const initializeIPList = () => {
  if (props.modelValue) {
    ipList.value = props.modelValue.split(',').map(ip => ip.trim()).filter(ip => ip);
  }
  if (ipList.value.length === 0) {
    ipList.value = [''];
  }
};

// 監聽props變化
watch(() => props.modelValue, () => {
  initializeIPList();
}, { immediate: true });

// 監聽ipList變化，更新modelValue
watch(ipList, () => {
  updateModelValue();
}, { deep: true });

// 更新模型值
const updateModelValue = () => {
  const validIPs = ipList.value.filter(ip => ip.trim() !== '');
  emits('update:modelValue', validIPs.join(','));
};

// 驗證IP格式
const isValidIP = (ip) => {
  if (!ip || ip.trim() === '') return true; // 空白視為有效（會被過濾掉）
  
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip.trim())) return false;
  
  const parts = ip.trim().split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

// 驗證單個IP輸入
const validateIP = (index) => {
  // 檢查所有IP是否有效
  hasInvalidIP.value = ipList.value.some((ip, idx) => {
    return ip.trim() !== '' && !isValidIP(ip);
  });
};

// 新增IP輸入框
const addIP = () => {
  ipList.value.push('');
};

// 移除IP輸入框
const removeIP = (index) => {
  if (ipList.value.length > 1) {
    ipList.value.splice(index, 1);
  }
};

// 移除空白的IP項目（但至少保留一個）
const removeEmptyIPs = () => {
  const nonEmptyIPs = ipList.value.filter(ip => ip.trim() !== '');
  if (nonEmptyIPs.length === 0) {
    ipList.value = [''];
  } else {
    ipList.value = [...nonEmptyIPs, ''];
  }
};

// 初始化
initializeIPList();
</script>

<style lang="scss" scoped>
.allow-ips-manager {
  .ip-input-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .error-message {
    color: #C24449;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .preview-area {
    margin-top: 12px;
    padding: 8px;
    background-color: #F3F9F9;
    border-radius: 4px;
    
    .preview-label {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }
    
    .preview-content {
      font-family: monospace;
      font-size: 13px;
      color: var(--color-text-primary);
      word-break: break-all;
    }
  }
}
</style>
