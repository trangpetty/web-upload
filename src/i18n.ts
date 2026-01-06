import { createI18n } from 'vue-i18n';
import messages from './lang';

const i18n = createI18n({
    legacy: false,
    locale: 'vi',
    fallbackLocale: 'en',
    globalInjection: true,
    messages,
});

export default i18n;
