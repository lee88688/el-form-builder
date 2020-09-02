import FormBuilder from './formbuilder.vue'

const install = function installFormBuilder (Vue) {
  Vue.component('el-form-builder', FormBuilder)
}

export default {
  install
}
