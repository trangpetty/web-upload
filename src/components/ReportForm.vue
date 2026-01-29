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
          :before-upload="beforeUpload"
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
      <button class="btn-confirm" :disabled="fileList.length === 0" @click="submitUpload">{{ $t('confirm') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import logo from "@/assets/images/logo.svg"
import flatVi from "@/assets/images/flag-vi.png"
import flatEn from "@/assets/images/flag-en.png"
import {ElMessage} from "element-plus"
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

const docLabel = ref("");

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

// hash = "upload?xxxx?type=6&lang=en"
if (hash?.startsWith("/upload?")) {
  const queryString = hash.replace("/upload?", "");
  const params = new URLSearchParams(queryString);

  // lấy id (chuỗi dài trước ?type=)
  id = queryString.split("?type=")[0].split("&")[0];

  // lấy type
  const typeStr = queryString.split("?type=")[1];
  type = typeStr ? parseInt(typeStr, 10) : 6;

  // lấy lang
  const lang = queryString.split("lang=")[1] || "vi";
  locale.value = lang;
  language.value = lang;
}

const reportName = getReportName(type, language.value);

function getReportName(type: number, lang: string) {
  console.log("lang =", lang);
  console.log("type =", type);
  console.log("reportNames[lang] =", reportNames[lang]);
  console.log("reportNames[lang]?.[type] =", reportNames[lang]?.[type]);
  return reportNames[lang]?.[type] || (lang === "vi" ? "Phản ánh khác" : "Other");
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  const maxImageSize = 20 * 1024 * 1024; // 20MB
  const maxVideoSize = 100 * 1024 * 1024; // 100MB

  if (isImage && file.size > maxImageSize) {
    ElMessage.warning("Ảnh vượt quá 20MB, vui lòng chọn ảnh nhỏ hơn!");
    return false;
  }

  if (isVideo && file.size > maxVideoSize) {
    ElMessage.warning("Video vượt quá 100MB, vui lòng chọn video nhỏ hơn!");
    return false;
  }

  if (!isImage && !isVideo) {
    ElMessage.warning("Chỉ chấp nhận ảnh hoặc video!");
    return false;
  }

  return true;
}

const handleChange = (file, fileListValue) => {
  fileList.value = fileListValue
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
  fileList.value = fileListNew
}

function isImage(file) {
  return file.raw?.type.startsWith('image/')
}

async function submitUpload() {
  loading.value = true;
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
      const params = new URLSearchParams(queryString);

      // lấy id (chuỗi dài trước ?type=)
      id = queryString.split("?type=")[0].split("&")[0];

      // lấy type
      const typeStr = params.get("type");
      type = typeStr ? parseInt(typeStr, 10) : null;

      // lấy lang
      const lang = params.get("lang") || "vi";
      locale.value = lang;
      language.value = lang;

      const docType = params.get("docType");
      
      if (docType === 'cccd') {
          docLabel.value = lang === 'vi' ? "Số CCCD" : "ID Card Number";
      } else if (docType === 'passport') {
          docLabel.value = lang === 'vi' ? "Số Hộ chiếu" : "Passport Number";
      } else {
          // Fallback nếu không có param (hoặc trường hợp cũ)
          docLabel.value = lang === 'vi' ? "Số giấy tờ tùy thân" : "Identity Document Number";
      }
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
</style>