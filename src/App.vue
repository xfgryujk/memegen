<template>
  <div v-if="template">
    <h1>{{ template.name }}</h1>
    <b-img fluid :src="`/static/${template.id}/example${template.extension}`" />
  </div>
</template>

<script>
import templates from './templates'

export default {
  name: 'app',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
    template () {
      if (!this.$route.params.template in templates) {
        return null
      }
      let tpl = templates[this.$route.params.template]
      return Object.assign({}, tpl, { id: this.$route.params.template })
    }
  }
}
</script>

<style scoped>
h1 {
  margin-top: 20px;
  margin-bottom: 15px;
}
</style>
