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
  // normal async get, with params, startupResolve
  it('normal async get. with params, startupResolve', async () => {
    const assertOrder = []
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('name', 'label', {
              asyncItems () {
                assertOrder.push(2)
                return new Promise(resolve => {
                  setTimeout(() => {
                    resolve('items')
                  }, 0)
                })
              }
            })
          ]
        },
        async startupResolve () {
          assertOrder.push(1)
        }
      }
    })
    expect(wrapper.vm.asyncGetItemsResult.name).toBeTruthy()
    await wrapper.vm.asyncGetItemsResult.name
    await wrapper.vm.$nextTick()
    expect(assertOrder).toEqual([2, 1])
    expect(wrapper.vm.config.elements[0].detail.items).toBe('items')
  })

  it('manually invoke asyncGetItems', async () => {
    const modelName = 'modelName'
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('name', 'label', {
              asyncItems (formData, name) {
                return new Promise(resolve => {
                  setTimeout(() => {
                    resolve([formData.name, name])
                  }, 0)
                })
              }
            })
          ]
        },
        asyncGetItemsOnCreated: false,
        model: { name: modelName }
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.asyncGetItemsResult).toBeFalsy()
    expect(wrapper.vm.config.elements[0].detail.items).toBeFalsy()
    await Promise.all(wrapper.vm.asyncGetItems())
    expect(wrapper.vm.config.elements[0].detail.items).toEqual([modelName, 'name'])
  })
  // multiple items sync
  it('multiple items sync', async () => {
    const assertOrder = []
    wrapper = mount(ElFormBuilder, {
      propsData: {
        config: {
          elements: [
            generateInputFormConfigItem('name1', 'label', {
              async asyncItems () {
                await new Promise(resolve => setTimeout(resolve, 0))
                await this.asyncGetItemsResult.name2
                assertOrder.push(1)
                return new Promise(resolve => {
                  setTimeout(() => {
                    resolve('items')
                  }, 0)
                })
              }
            }),
            generateInputFormConfigItem('name2', 'label', {
              async asyncItems () {
                assertOrder.push(2)
                return new Promise(resolve => {
                  setTimeout(() => {
                    resolve('items')
                  }, 100)
                })
              }
            })
          ]
        },
        asyncGetItemsOnCreated: false
      }
    })
    await wrapper.vm.$nextTick()
    await Promise.all(wrapper.vm.asyncGetItems())
    expect(assertOrder).toEqual([2, 1])
  })
})
