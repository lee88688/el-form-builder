import { mount } from '@vue/test-utils'
import ElFromBuilder from '@/formbuilder'
import Vue from 'vue'
import ElementUI from 'element-ui'

beforeAll(() => {
  Vue.use(ElementUI)
})

describe('ElFromBuilder.vue', () => {
  it('renders props.msg when passed', () => {
    const wrapper = mount(ElFromBuilder, {
      propsData: {}
    })
    console.log(wrapper)
  })
})
