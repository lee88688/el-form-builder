import { mount } from '@vue/test-utils'
import ElFormBuilder from '@/formbuilder'
import Vue from 'vue'
import ElementUI, { Col, FormItem, Input } from 'element-ui'
import { generateInputFormConfigItem } from '../lib'

beforeAll(() => {
  Vue.use(ElementUI)
})

describe('ElFromBuilder.vue', () => {
  it('renders props.msg when passed', async () => {
    const name = 'name'
    const label = 'label'
    const wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem(name, label)
          ]
        }
      }
    })
    const cols = wrapper.findAllComponents(Col)
    expect(cols.length).toBe(1)
    const formItem = cols.at(0).findComponent(FormItem)
    expect(formItem.vm.label).toBe(label)
    const input = formItem.findComponent(Input)
    const inputChar = '3'
    await input.vm.$emit('input', inputChar)
    expect(wrapper.vm.formValues[name]).toBe(inputChar)
  })
})
