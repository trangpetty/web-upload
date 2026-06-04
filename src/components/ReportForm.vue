<template>
  <div class="h-100">
    <header class="header">
        <h3 class="title">{{ $t('header') }}</h3>
        <div class="flags">
          <img 
            :src="flatVi" 
            alt="VI" 
            @click="changeLanguage('vi')"
            :class="{ 'active': language === 'vi' }" 
          />
          <img 
            :src="flatEn" 
            alt="EN" 
            @click="changeLanguage('en')"
            :class="{ 'active': language === 'en' }" 
          />
        </div>
    </header>
    <div class="logo-container">
      <img :src="logo" alt="" class="logo">
    </div>
    <div class="report-form h-100" v-loading="loading">
      <div class="box">
        <h3 class="box-title">{{ $t('citizen.info') }}</h3>
        <div>
          <p class="box-text">- {{ $t('label.name') }}: {{ citizenInfo.fullName ? citizenInfo.fullName : "" }}</p>
          <p class="box-text">- {{ docLabel }}: {{ citizenInfo.idNumber ? citizenInfo.idNumber : "" }}</p>
          <p class="box-text">- {{ $t('label.phone') }}: {{ citizenInfo.phone ? citizenInfo.phone : "" }}</p>
          <p class="box-text">- {{ $t('label.address') }}: {{ citizenInfo.address ? citizenInfo.address : "" }}</p>
        </div>
      </div>
      <div class="box">
        <h3 class="box-title">{{ $t('report.content') }}</h3>
        <div>
          <p class="box-text">- {{ $t('report.name') }}: {{ reportName }}</p>
        </div>
      </div>
      <div class="box">
        <h3 class="box-title">{{ $t('report.image') }}</h3>
        <el-upload
          class="custom-upload"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleChange"
          accept="image/*,video/*"
          multiple
          :show-file-list="true"
          list-type="picture-card"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          >
            <div class="upload-icon-wrapper">
              <img src="@/assets/images/upload.png" alt="Upload Icon" class="upload-icon" />
              <div class="el-upload__text">{{ $t('upload') }}</div>
            </div>
        </el-upload>
      </div>
      <el-dialog v-model="previewDialog.visible" width="60%" top="10vh" :close-on-click-modal="true">
        <template #default>
          <img v-if="isImage(previewDialog.file)" :src="previewDialog.url" style="width: 100%;" />
          <video v-else controls style="width: 100%;">
            <source :src="previewDialog.url" />
            Your browser does not support the video tag.
          </video>
        </template>
      </el-dialog>
      <div class="error-container" v-if="showLimitError">
        <el-alert
          :title="`${$t('text.warning')} ${MAX_TOTAL_SIZE_MB}MB.`"
          type="error"
          show-icon
          :closable="false"
          class="error-notification"
        >
        <template #icon>
          <WarningFilled />
        </template>
        </el-alert>
      </div>
      <button type="button" class="btn-confirm" :disabled="fileList.length === 0" @click="submitUpload">{{ $t('confirm') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch, computed} from 'vue'
import logo from "@/assets/images/logo.svg"
import flatVi from "@/assets/images/flag-vi.png"
import flatEn from "@/assets/images/flag-en.png"
import {ElMessage} from "element-plus"
import { WarningFilled } from '@element-plus/icons-vue'
import axios from "axios";
import router from "@/router";
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const language = ref("vi");
const citizenInfo = ref({});
const loading = ref(false);
const fileList = ref([]);
const previewDialog = ref({
  visible: false,
  url: '',
  file: null
})

const currentType = ref(6);
const docType = ref("cccd");
const docLabel = computed(() => {
  const type = docType.value;
  if (type === "cccd") {
    return t('label.idNumber');
  } 
  else if (type === "passport") {
    return t('label.passport');
  }
  return t('label.docType'); 
});
const showLimitError = ref(false);
let errorTimeout:any = null;
const MAX_TOTAL_SIZE_MB = 500;
const MAX_TOTAL_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const VIDEO_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik00MCAzNVYzMEw2NSDidC0yNS0xNVoiIGZpbGw9IiM5MDkzOTkiLz48L3N2Zz4=";

const reportNames: Record<string, Record<number, string>> = {
  vi: {
    1: "Cướp giật tài sản",
    2: "Mâu thuẫn, xô xát",
    3: "Ép giá, đeo bám khách hàng",
    4: "Mất trộm tài sản",
    5: "Thất lạc đồ vật",
    6: "Phản ánh khác"
  },
  en: {
    1: "Robbery of property",
    2: "Conflict and altercation",
    3: "Overcharging or harassing customers",
    4: "Theft of property",
    5: "Loss of property",
    6: "Other"
  }
};

const url = window.location.href;
const hash = url.split("#")[1]; 
let id: string | null = null;
let type = 6;

const reportName = computed(() => {
  return getReportName(currentType.value, language.value);
});

function getReportName(type: number, lang: string) {
  const list = reportNames[lang] || reportNames['vi'];
  return list[type] || (lang === 'en' ? "Other" : "Phản ánh khác");
}

const createVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = video.duration > 1 ? 1 : video.duration / 2;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg', 0.7); // Nén chất lượng 0.7 cho nhẹ
      URL.revokeObjectURL(video.src);
      
      resolve(imageUrl);
    };
    
    video.onerror = () => {
       resolve('');
    };
  });
};

const handleChange = async (uploadFile, fileListValue) => {
  const totalSize = fileListValue.reduce((acc, file) => {
    const fileSize = file.raw?.size || file.size || 0;
    return acc + fileSize;
  }, 0);

  if (totalSize > MAX_TOTAL_BYTES) {
    showLimitError.value = true;
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    errorTimeout = setTimeout(() => {
      showLimitError.value = false;
    }, 10000);
    const allowedFiles = fileListValue.filter(f => f.uid !== uploadFile.uid);
    fileList.value = allowedFiles;
    return;
  } else {
    if (uploadFile.raw?.type.startsWith('video/')) {
    uploadFile.url = VIDEO_PLACEHOLDER; 

    try {
      const thumbUrl = await createVideoThumbnail(uploadFile.raw);
      
      if (thumbUrl) {
        uploadFile.url = thumbUrl;
      }
    } catch (e) {
      console.error("Không tạo được thumbnail", e);
    }
  }
    showLimitError.value = false;
    if (errorTimeout) clearTimeout(errorTimeout);
    fileList.value = fileListValue;
  }
}

const changeLanguage = (lang: string) => {
  locale.value = lang
  language.value = lang
}

function handlePreview(file) {
  const isVideo = file.raw?.type.startsWith('video/')
  const url = file.url || URL.createObjectURL(file.raw)
  previewDialog.value = {
    visible: true,
    url,
    file
  }
}

function handleRemove(file, fileListNew) {
  fileList.value = fileListNew;
  showLimitError.value = false;
}

function isImage(file) {
  return file.raw?.type.startsWith('image/')
}

async function submitUpload() {
  const totalSize = fileList.value.reduce((acc: any, file: any) => {
    return acc + (file.raw?.size || file.size || 0);
  }, 0);

  if (totalSize > MAX_TOTAL_BYTES) {
    showLimitError.value = true; 
    errorTimeout = setTimeout(() => {
      showLimitError.value = false;
    }, 10000);
    return;
  }
  
  showLimitError.value = false;

  loading.value = true;
    if (errorTimeout) clearTimeout(errorTimeout);

  const fileObjs = fileList.value.map(
      (item: any) => item.raw || item.originFileObj || item
  );

  const url = window.location.href;
  const id = url.split("?")[1];
  const formData = new FormData();
  fileObjs.forEach((file: File) => formData.append("files", file));
  formData.append("id", id || "");

  try {
    const res = await axios.post(`https://dev.mk.com.vn:15670/api/device/transaction/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });


    if (res.data.success) {
      router.push({ name: "result", query: { success: "true" } });
    } else {
      router.push({ name: "result", query: { success: "false" } });
    }
  } catch (error) {
    ElMessage.warning("Lỗi kết nối hoặc máy chủ.");
  }
  loading.value = false;
}

const updatePageTitle = () => {
  document.title = t('header.title'); 
}

watch(locale, () => {
  updatePageTitle();
});

onUnmounted(() => {
  if (errorTimeout) clearTimeout(errorTimeout);
});

onMounted(async () => {
  updatePageTitle();
  try {
    const url = window.location.href;
    const hash = url.split("#")[1]; 
    let id: string | null = null;
    let type: number | null = null;

    // hash = "upload?xxxx?type=6&lang=en"
    if (hash?.startsWith("/upload?")) {
      const queryString = hash.replace("/upload?", "");
      let paramsStr = queryString;
      if (queryString.includes("?")) {
          // Lấy phần sau dấu ? thứ 2 (type=1&lang=en...)
          paramsStr = queryString.split("?")[1]; 
      }
      
      // Lúc này paramsStr sạch sẽ, chỉ chứa các tham số
      const params = new URLSearchParams(paramsStr);

      // Lấy ID: vẫn giữ logic cũ
      id = queryString.split("?type=")[0].split("&")[0];

      // Lấy Type: Giờ sẽ hoạt động đúng
      const typeStr = params.get("type");
      currentType.value = typeStr ? parseInt(typeStr, 10) : 6;

      // Lấy Lang
      const lang = params.get("lang") || "vi";
      locale.value = lang;
      language.value = lang;

      docType.value = params.get("docType");
    }

// Lấy citizen info
    const res = await axios.get(
        `https://dev.mk.com.vn:15670/api/device/transaction/citizeninfo?language=${language.value}&id=${id}`
    );
    if(res.data.success && res.data.data != null) citizenInfo.value = res.data.data;
    else if (res.data.code == 709) {
      router.push({ name: "result", query: { success: "true", reason: "709" } });
    }
  } catch (error) {
    console.error("Lỗi khi lấy citizen info:", error);
  }
});
</script>

<style>
.title {
  font-size: 18px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  color: var(--yellow);
}

.flags {
  display: flex;
  gap: 10px; 
  align-items: center;
}

.flags img {
  cursor: pointer;
  width: 32px; 
  height: auto;
  opacity: 0.5; 
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 4px;
}

.flags img.active {
  opacity: 1;
  transform: scale(1.5);
}

.logo-container {
  margin: 0 auto;
  text-align: center;
}

.logo {
  width: 130px;
  height: 100px;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px;
  background-color: white;
  margin-top: 50px;
  border-radius: 10px;
}

.box-title {
  color: var(--text-color);
  font-weight: bold;
  font-size: 20px;
  text-transform: uppercase;
  margin: 0 0 10px 0;
}

.box-text {
  font-size: 16px;
  margin: 0 0 6px 0;
}

.btn-confirm {
  padding: 16px 8px;
  background-color: #C10000;
  border-radius: 25px;
  color: #fff;
  font-size: 16px;
  text-transform: uppercase;
  font-weight: 700;
  border: none;
}

.btn-confirm:disabled {
  background-color: #F4F4F4;
}

.btn-confirm:hover,
.btn-confirm:focus {
  background-color: var(--light-red);
  color: var(--text-color);
}

.custom-upload.el-upload--picture-card {
  --el-upload-picture-card-size: 80px;
  background-color: #FFFFFF;
  border: 1px solid #EAEAEA;
  box-shadow: 0px 1px 8px 0px #2F2B3D1A;

}

.el-upload__text {
  font-size: 12px;
  text-align: center;
  line-height: 1.2;
}

.upload-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 30px;
  height: 30px;
  margin-bottom: 6px;
}

.custom-upload .el-upload--picture-card {
  border: 1px solid rgb(234, 234, 234);
  background: rgb(255, 255, 255);
  box-shadow: rgba(47, 43, 61, 0.1) 0px 1px 8px 0px;
  width: 80px;
  height: 80px;
}

.custom-upload .el-upload-list--picture-card .el-upload-list__item {
  height: 80px !important;
  width: 80px !important;
}

.error-notification {
  width: 100%;
  top: auto !important;   
  background-color: #D11C0E1A!important; 
}

.error-notification .el-message__content {
  line-height: 1.5;
}

.error-notification.el-alert--error.is-light {
  color: #000!important;
}

.error-notification.el-alert .el-alert__icon {
  width: 32px!important;
  color: #E41606;
  font-size: 32px!important;
}
</style>