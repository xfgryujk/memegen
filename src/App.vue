<template>
  <div v-if="templateInfo">
    <h1>{{ templateInfo.name }}</h1>
    <b-img fluid :src="imageSrc" />
    <b-form @submit.prevent="generate" v-if="template">
      <b-form-group v-for="(textInfo, index) in template.textInfo" :key="index" :label="`第${index + 1}句`" :label-for="`text-${index}`">
        <b-form-input :id="`text-${index}`" type="text" v-model="textInfo.text" :placeholder="textInfo.default"></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary" :disabled="template.isBusy()">生成</b-button>
      <b-alert variant="success" dismissible :show="showSuccess" @dismissed="showSuccess=false">生成完毕</b-alert>
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
      template: null,
      showSuccess: false
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
    $route (to) {
      this.updateTemplate()
    },
    imageSrc (val, oldVal) {
      window.URL.revokeObjectURL(oldVal)
    }
  },
  mounted () {
    this.updateTemplate()
  },
  methods: {
    updateTemplate () {
      this.template = null
      if (!this.templateInfo) {
        return
      }

      this.imageSrc = `static/${this.templateId}/example${this.templateInfo.extension}`
      this.template = new Template(this.templateId)
    },
    async generate () {
      if (!this.templateInfo) {
        return
      }

      let resultBlob = await this.template.generate()
      this.imageSrc = window.URL.createObjectURL(resultBlob)
      this.showSuccess = true
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

.btn {
  margin-bottom: 16px;
}
</style>
