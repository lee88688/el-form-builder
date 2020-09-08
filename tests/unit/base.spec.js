import { mount } from '@vue/test-utils'
import ElFormBuilder from '@/formbuilder'
import Vue from 'vue'
import ElementUI, { Col, FormItem, Input, Button } from 'element-ui'
import { generateInputFormConfigItem } from '../lib'
import TestScopedSlots from '../TestScopedSlots.vue'
// const TestScopedSlots = require('../TestScopedSlots')

let wrapper

beforeAll(() => {
  Vue.use(ElementUI)
})

afterEach(() => {
  if (wrapper) {
    wrapper.destroy()
  }
})

describe('ElFromBuilder base test', () => {
  it('render normal input, props, rules and detail options', async () => {
    const name = 'name'
    const label = 'label'
    const className = 'test'
    const style = { opacity: '1' }
    let inputFormValue = null
    const paramsP = 'p'
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem(name, label, {
              clearable: true,
              style,
              className,
              input (formValues) {
                inputFormValue = formValues[name]
              },
              on: {
                focus (_, formValues) {
                  inputFormValue = this.params.p
                }
              }
            })
          ]
        },
        params: { p: paramsP }
      }
    })
    // test structure of the rendered component
    const cols = wrapper.findAllComponents(Col)
    expect(cols.length).toBe(1)
    const formItem = cols.at(0).findComponent(FormItem)
    expect(formItem.vm.label).toBe(label)
    const input = formItem.findComponent(Input)
    // input event test
    const inputChar = '3'
    input.vm.$emit('input', inputChar)
    expect(wrapper.vm.formValues[name]).toBe(inputChar)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().input).toBeTruthy()
    expect(inputFormValue).toBe(inputChar)
    // click event test
    inputFormValue = null
    input.vm.$emit('focus')
    expect(inputFormValue).toBe(paramsP)
    // class and style
    expect(input.classes()).toContain(className)
    expect(input.attributes('style')).toContain(`opacity: ${style.opacity}`)
    // element props
    expect(input.vm.clearable).toBe(true)
  })

  it('slots test', async () => {
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('name1', 'label1', {
              slots (h) {
                return [
                  h('span', { slot: 'append', attrs: { id: 'span' } }, ['%'])
                ]
              }
            }),
            generateInputFormConfigItem('button1', 'label2', {
              tag: 'el-button',
              slots: ['slot']
            })
          ]
        }
      }
    })
    const cols = wrapper.findAllComponents(Col)
    expect(cols.length).toBe(2)
    const input = cols.at(0).findComponent(Input)
    const button = cols.at(1).findComponent(Button)
    expect(input.vm.$slots.append).toBeTruthy()
    const appendDiv = input.find('.el-input-group__append')
    expect(appendDiv.exists()).toBe(true)
    const span = appendDiv.find('#span')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('%')
    expect(button.text()).toBe('slot')
  })

  it('scoped slots test', async () => {
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('name1', 'label1', {
              tag: TestScopedSlots,
              title: 'slot1',
              scopedSlots (h) {
                return {
                  h1: ({ title }) => h('span', { attrs: { id: 'span' } }, [title])
                }
              }
            }),
            generateInputFormConfigItem('name2', 'label2', {
              tag: TestScopedSlots,
              title: 'slot2',
              scopedSlots: {
                h1: ({ title }) => title
              }
            })
          ]
        }
      }
    })
    const cols = wrapper.findAllComponents(Col)
    expect(cols.length).toBe(2)
    // first element
    const testFuncSlot = cols.at(0).findComponent(TestScopedSlots)
    expect(testFuncSlot.vm.$scopedSlots.h1).toBeTruthy()
    const funcSlotSpan = testFuncSlot.find('#span')
    expect(funcSlotSpan.exists()).toBe(true)
    expect(funcSlotSpan.text()).toBe('slot1')
    // second element
    const testSlot = cols.at(1).findComponent(TestScopedSlots)
    expect(testSlot.vm.$scopedSlots.h1).toBeTruthy()
    const h1Div = testSlot.find('#h1')
    expect(h1Div.exists()).toBe(true)
    expect(h1Div.text()).toBe('slot2')
  })
})
