export default {
  elements: [
    {
      item: { label: '' },
      detail: {
        name: '',
        props: '',
        // ...
        items: [],
        style: {},
        className: '',
        async asyncItems (formValues) {},
        input (formValues) {},
        on: {
          click (e, formValues) {}
        },
        slots: [],
        // slots(formValues) { return [] }
        scopedSlots: []
        // scopedSlots(formValues) { return { [String]: Function } }
      }
    }
  ],
  rules: {
    name: [
      { trigger: 'blur/change', required: true, message: 'xxx' },
      { trigger: '', validator () {} }
    ]
  }
}
