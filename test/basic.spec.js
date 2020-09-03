import Vue from 'vue'
import { mount } from '@vue/test-utils'
import ElementUI from 'element-ui'
import ElFormBuilder from '../src/formbuilder.vue'
import { generateInputFormConfigItem } from './lib'

let wrapper = null;

beforeAll(() => {
  Vue.use(ElementUI)
})

afterEach(() => {
  wrapper.destroy()
})

describe('basic test', () => {
  test('basic el-input', () => {
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('name', 'label')
          ]
        }
      }
    })
    console.log('test', wrapper.findComponent('el-form'))
  })
})
