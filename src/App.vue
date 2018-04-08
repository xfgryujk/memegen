<template>
  <div v-if="templateInfo">
    <h1>{{ templateInfo.name }}</h1>
    <b-img fluid :src="imageSrc" />
    <b-form @submit.prevent="generate" v-if="template">
      <b-form-group v-for="(textInfo, index) in template.textInfo" :key="index" :label="`第${index + 1}句`" :label-for="`text-${index}`">
        <b-form-input :id="`text-${index}`" type="text" v-model="textInfo.text" :placeholder="textInfo.default"></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary">生成</b-button>
    </b-form>
  </div>
</template>

<script>
import templateList from './templateList'
import { Template } from './memegen'

export default {
  name: 'app',
  data () {
    return {
      imageSrc: '',
      template: null
    }
  },
  computed: {
    templateId () {
      return this.$route.params.id
    },
    templateInfo () {
      return templateList[this.templateId] || null
    }
  },
  watch: {
    async $route (to) {
      await this.updateTemplate()
    }
  },
  async mounted () {
    await this.updateTemplate()
  },
  methods: {
    async updateTemplate () {
      this.template = null
      if (!this.templateInfo) {
        return
      }

      this.imageSrc = `static/${this.templateId}/example${this.templateInfo.extension}`
      this.template = await Template.createAsync(this.templateId)
    },
    async generate () {
      if (!this.templateInfo) {
        return
      }

      let blob = await this.template.generate()
      // Test
      window.open(window.URL.createObjectURL(blob))
    }
  }
}
</script>

<style scoped>
h1 {
  margin-top: 20px;
  margin-bottom: 15px;
}

form {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
