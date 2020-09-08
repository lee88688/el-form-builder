<template>
  <div>
    <div id="h1">
      <slot name="h1" :title="title" />
    </div>
    <div>body</div>
  </div>
</template>

<script>
export default {
  name: 'TestScopedSlots',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
