export function generateInputFormConfigItem (name, label, options = {}) {
    const { tag = 'el-input', ...otherOptions } = options
    return {
      tag,
      item: { label },
      detail: {
        name,
        ...otherOptions
      }
    }
  }