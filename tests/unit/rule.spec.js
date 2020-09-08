import { mount } from '@vue/test-utils'
import ElFormBuilder from '@/formbuilder'
import Vue from 'vue'
import ElementUI, { Col, FormItem, Input } from 'element-ui'
import { generateInputFormConfigItem } from '../lib'

let wrapper

beforeAll(() => {
  Vue.use(ElementUI)
})

afterEach(() => {
  if (wrapper) {
    wrapper.destroy()
  }
})

describe('ElFromBuilder rule test', () => {
  it('rule base', async () => {
    const requiredMessage = 'required message'
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('requiredChange', 'label')
          ],
          rules: {
            requiredChange: [{ required: true, message: requiredMessage, trigger: 'change' }],
            requiredBlur: [{ required: true, message: requiredMessage, trigger: 'blur' }]
          }
        }
      }
    })
    const cols = wrapper.findAllComponents(Col)
    expect(cols.length).toBe(1)
    const changeInput = cols.at(0).findComponent(Input)
    const changeFormItem = cols.at(0).findComponent(FormItem)
    changeInput.vm.$emit('input', '')
    await wrapper.vm.$nextTick()
    const messageDiv = changeFormItem.find('div.el-form-item__error')
    expect(messageDiv.text()).toBe(requiredMessage)
  })
})
