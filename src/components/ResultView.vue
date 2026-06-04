<template>
  <div class="h-100">
    <header class="header">
        <h3 class="title">{{ $t('header') }}</h3>
        <img :src="logo" alt="">
    </header>
    <div>
      <div class="icon-container">
        <img :src="status ? iconSuccess : iconFail" alt="" class="icon">
      </div>
      <div class="text-container">
        <h3 class="text-status">
          {{ textStatus}}
        </h3>
        <p class="text-desc" v-html="textDesc"></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/images/logo.svg";
import iconSuccess from "@/assets/images/icon-success.png";
import iconFail from "@/assets/images/icon-fail.png";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const route = useRoute();
const status = route.query.success === "true";
const reason = route.query.reason;
const textStatus = ref('');
const textDesc = ref('')

onMounted(() => {
  if(status) {
    if(reason == "709") {
      textStatus.value = t("status.confirm");
      textDesc.value = t("text.desc.confirm");
    }
    else {
      textStatus.value = t("status.success");
      textDesc.value = t("text.desc.success")
    }
  }
  else {
    textStatus.value = t("status.fail");
    textDesc.value = t("text.desc.fail");
  }
})

</script>

<style>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  top: 24px;
}
.header img {
    width: 48px;
    height: 36px;
}

.title {
  font-weight: 700;
  color: #FCD006;
}

.icon-container {
  text-align: center;
  margin: 0 auto;
}

.icon {
  width: 280px;
  height: 280px;
}

.text-container {
  text-align: center;
  padding: 0 20px;
  color: #fff;
}

.text-status {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.text-desc {
  font-size: 18px;
}
</style>