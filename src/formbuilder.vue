<script>
function isFunction (functionToCheck) {
  return (
    !!functionToCheck &&
    Object.prototype.toString.call(functionToCheck) === '[object Function]'
  )
}

export default {
  name: 'ElFormBuilder',

  model: {
    prop: 'model'
  },
  props: {
    model: {
      type: Object,
      default () {
        return {}
      }
    },
    config: {
      type: Object,
      default () {
        return {
          rules: {},
          elements: []
        }
      }
    },
    params: {
      type: Object,
      default () { return {} }
    },
    size: {
      type: String,
      default: 'medium'
    },
    labelWidth: {
      type: String,
      default: '150px'
    },
    rowGutter: {
      type: Number,
      default: null
    },
    columns: {
      type: Number,
      default: 1
    },
    inline: {
      type: Boolean,
      default: false
    },
    asyncGetItemsOnCreated: {
      type: Boolean,
      default: true
    },
    startupResolve: {
      type: Function,
      default: null
    }
  },

  data () {
    return {
      updating: false,
      formValues: this.mergeValues()
    }
  },

  computed: {
    colSpan () {
      return Math.floor(24 / this.columns)
    }
  },

  watch: {
    formValues: {
      handler (formValues) {
        this.updating = true
        this.$emit('input', formValues)
      },
      deep: true
    },
    model: {
      handler (model) {
        if (!this.updating) {
          this.formValues = this.mergeValues()
        } else {
          this.updating = false
        }
      },
      deep: true
    },
    config: {
      handler () {
        this.formValues = this.mergeValues()
      },
      deep: true
    }
  },

  provide () {
    return {
      getFormBuilder: () => this
    }
  },

  async created () {
    if (this.asyncGetItemsOnCreated) {
      // startupResolve用于等待asyncGetItems完成后进行回调
      if (isFunction(this.startupResolve)) await Promise.all(this.asyncGetItems())
      else this.asyncGetItems()
    }
    this.$emit('input', this.formValues)
    isFunction(this.startupResolve) && this.startupResolve()
  },

  methods: {
    setDefaultValue (name, callback) {
      return new Promise(resolve => {
        const fn = async () => {
          const getItemsResult = this.asyncGetItemsResult && this.asyncGetItemsResult[name]
          const { detail: { asyncItems }} = this.findElement(name)
          const asyncItemsIsFunction = isFunction(asyncItems)
          // 选项中asyncItems必须为函数，asyncItems已经执行完成
          // 如果asyncGetItemsOnCreated或者formValues有值才开始等待
          const needWaiting = this.asyncGetItemsOnCreated || this.formValues
          if (needWaiting && asyncItemsIsFunction && !getItemsResult) {
            setTimeout(fn, 0)
            return
          }
          if (asyncItemsIsFunction) {
            // 如果asyncItems为一个函数那才会有异步的情况，否则为同步。
            await getItemsResult
          }
          if (isFunction(callback)) callback(this, this.formValues, name)
          // 同步的情况下，首次调用mergeValues时formValues为undefined
          resolve(this.formValues && this.formValues[name])
        }
        fn()
      })
    },

    mergeValues () {
      const vm = this
      const { model } = vm
      const defaultValues = {}

      this.config.elements.forEach(({ tag, detail = {}}) => {
        // eslint-disable-next-line prefer-const
        let { defaultValue = null, name } = detail

        // 当默认值为函数时
        if (isFunction(defaultValue) && name) {
          defaultValues[name] = null
          if (!isFunction(detail.asyncItems)) {
            // 当为同步情况时需要拦截setDefaultValue回调函数的formData，改为当前函数中的defaultValues
            // 同步的默认值才会在一开始就生效，因为formValues在一开始就调用了一次mergeValues。
            const fn = (vm, formData, name) => defaultValue(vm, defaultValues, name)
            this.setDefaultValue(name, fn)
          } else {
            this.setDefaultValue(name, defaultValue)
          }
          return
        }

        if (tag === 'el-checkbox' || (tag === 'el-select' && detail.multiple)) {
          defaultValue = defaultValue != null ? defaultValue : []
        }

        name && (defaultValues[name] = defaultValue) // if it not contains name, ignore
      })

      return {
        ...defaultValues,
        ...model
      }
    },

    filterAttrs (detail = {}) {
      const keys = Object.keys(detail)
      const attrs = {}

      keys.forEach(key => {
        const value = detail[key]
        // type for el-button
        if (key === 'style' || key === 'class' || key === 'type') return
        if (
          typeof value === 'number' ||
          typeof value === 'string' ||
          typeof value === 'boolean'
        ) {
          attrs[key] = value
        }
      })

      return attrs
    },

    asyncGetItems (names = ['_all']) {
      const nameMap = {}
      names.forEach(n => { nameMap[n] = true })
      this.asyncGetItemsResult = this.asyncGetItemsResult || {}
      this.config.elements.forEach(({ detail }) => {
        const fn = async () => {
          if (isFunction(detail.asyncItems) && (nameMap['_all'] || nameMap[detail.name])) {
            // console.log(detail.name, 'await before')
            const items = await detail.asyncItems.call(this, this.formValues)
            // console.log(detail.name, 'await after')
            this.$set(detail, 'items', items)
          }
        }
        this.asyncGetItemsResult[detail.name] = fn()
      })
      if (names[0] === '_all') {
        return Object.keys(this.asyncGetItemsResult).map(k => this.asyncGetItemsResult[k])
      } else {
        return names.map(k => this.asyncGetItemsResult[k])
      }
    },

    renderFormItem (h, { tag, item: label = {}, detail = {}, col = {}, condition }) {
      const vm = this
      const { formValues, size } = vm
      // 如果存在condition函数并且返回为true才渲染该item
      if (isFunction(condition) && condition.call(vm, formValues) !== true) return
      const { name, input, on, style = {}, className = {}} = detail
      const value = formValues[name] !== undefined ? formValues[name] : null // change undefined to null, others not
      // slots can be a function which returns an array or an array
      let slots
      if (isFunction(detail.slots)) {
        slots = detail.slots.call(this, h)
      } else {
        slots = detail.slots || []
      }
      let scopedSlots
      if (isFunction(detail.scopedSlots)) {
        scopedSlots = detail.scopedSlots.call(this, h)
      } else {
        scopedSlots = detail.scopedSlots || []
      }
      // events
      const customEvents = {}
      Object.keys(on || {}).forEach(k => {
        if (isFunction(on[k])) {
          customEvents[k] = e => on[k].call(vm, e, formValues)
        }
      })
      const modelEvents = {
        ...customEvents,
        input: function (value) {
          formValues[name] = value
          if (isFunction(input)) input.call(vm, vm.formValues)
        }
      }

      let children = []

      if (tag === 'el-select') {
        const select = h(
          tag,
          {
            attrs: {
              ...vm.filterAttrs(detail)
            },
            props: {
              value,
              ...detail
            },
            on: {
              ...modelEvents
            },
            style,
            'class': className,
            scopedSlots
          },
          (detail.items || []).map(option => {
            return h('el-option', {
              attrs: {
                ...vm.filterAttrs(option)
              },
              props: {
                key: option.value,
                ...option
              }
            })
          })
        )
        children = [select]
      } else if (tag === 'el-checkbox') {
        const checkbox = h(
          'el-checkbox-group',
          {
            attrs: {
              ...vm.filterAttrs(detail)
            },
            props: {
              value,
              ...detail
            },
            on: {
              ...modelEvents
            },
            style,
            'class': className
          },
          (detail.items || []).map(option => {
            return h(
              'el-checkbox',
              {
                attrs: {
                  ...vm.filterAttrs(option)
                },
                props: {
                  key: option.value,
                  label: option.value,
                  ...option
                }
              },
              [option.text]
            )
          })
        )

        children = [checkbox]
      } else if (tag === 'el-radio') {
        const radios = (detail.items || []).map(option => {
          option = {
            name: detail.name,
            ...option
          }
          return h(
            tag,
            {
              attrs: {
                ...vm.filterAttrs(option)
              },
              props: {
                value,
                ...option
              },
              on: {
                ...modelEvents
              },
              style,
              'class': className
            },
            [option.text]
          )
        })
        children = [...radios]
      } else {
        const input = h(tag || 'el-input', {
          attrs: {
            ...vm.filterAttrs(detail)
          },
          props: {
            value,
            ...detail
          },
          on: {
            ...modelEvents
          },
          style,
          'class': className,
          scopedSlots
        }, slots || [])
        children = [input]
      }

      const formItemStyle = label.style
      const formItem = h(
        'el-form-item',
        {
          props: {
            size,
            prop: name,
            ...label
          },
          style: formItemStyle
        },
        children
      )

      if (!this.inline) {
        let { span } = col
        span = span || this.colSpan
        return h(
          'el-col',
          {
            props: {
              span
            }
          },
          [formItem]
        )
      } else {
        return formItem
      }
    },

    renderFormItems (h) {
      const vm = this

      return this.config.elements.map((item, index) => {
        return vm.renderFormItem(h, item, index)
      })
    },
    clearValidate () {
      this.$refs.form.clearValidate()
    },
    async validate () {
      return this.$refs.form.validate()
    },
    resetFields () {
      // this.$refs.form && this.$refs.form.resetFields()
      const defaultValues = {}
      this.config.elements.forEach(({ tag, detail = {}}) => {
        // eslint-disable-next-line prefer-const
        let { defaultValue = null, name } = detail

        if (isFunction(defaultValue)) {
          defaultValue[name] = null
          return
        }

        if (tag === 'el-checkbox' || (tag === 'el-select' && detail.multiple)) {
          defaultValue = defaultValue != null ? defaultValue : []
        }

        name && (defaultValues[name] = defaultValue) // if it not contains name, ignore
      })
      this.$emit('input', defaultValues)
    },
    findElement (name) {
      return this.config.elements.find(item => item.detail.name === name)
    }
  },

  render (h) {
    const vm = this
    const children = [
      ...(vm.$slots.prepend || []),
      ...(vm.renderFormItems(h) || []),
      ...(vm.$slots.append || [])
    ]

    return h(
      'el-form',
      {
        props: {
          model: vm.formValues,
          rules: vm.config.rules,
          labelWidth: vm.labelWidth,
          inline: vm.inline
        },
        class: {
          'el-form-builder': true
        },
        ref: 'form'
      },
      [
        h('el-row', { props: { type: 'flex', gutter: this.rowGutter }}, children)
      ]
    )
  }
}
</script>

<style>
.el-form-builder .el-select {
    width: 100%;
}

.el-form-builder  .el-row {
  flex-wrap: wrap; /* use flex wrap to break line. */
}
</style>
