<template>
  <main class="py-md-3 pl-md-4" v-if="templateInfo">
    <h1 class="py-3">{{ templateInfo.name }}</h1>
    <b-img fluid :src="imageSrc" />
    <b-progress class="my-3" :value="progress" :max="100" animated v-if="progress >= 0"></b-progress>
    <b-alert class="my-3" variant="success" dismissible :show="showSuccess" @dismissed="showSuccess=false">生成完毕</b-alert>
    <b-form class="my-3" @submit.prevent="generate" v-if="template">
      <b-form-group v-for="(textInfo, index) in template.textInfo" :key="index" :label="`第${index + 1}句`" :label-for="`text-${index}`">
        <b-form-input :id="`text-${index}`" type="text" v-model="textInfo.text" :placeholder="textInfo.default"></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary" :disabled="isBusy">生成</b-button>
      <b-button variant="primary" @click="saveImage()" :disabled="isBusy">保存</b-button>
    </b-form>
  </main>
</template>

<script>
import download from 'downloadjs'

import templateList from './templateList'
import { TEMPLATES_URL } from './settings'
import { Template } from './memegen'

export default {
  name: 'app',
  data () {
    return {
      imageSrc: '',
      showSuccess: false,
      template: null
    }
  },
  computed: {
    templateId () {
      return this.$route.params.id
    },
    templateInfo () {
      return templateList[this.templateId] || null
    },
    progress () {
      if (!this.template) {
        return -1 // Don't show progress
      } else if (this.template.isLoading) {
        return this.template.loadingProgress * 100
      } else if (this.template.isGenerating) {
        return this.template.generatingProgress * 100
      }
      return -1
    },
    isBusy () {
      return this.template.isLoading || this.template.isGenerating
    }
  },
  watch: {
    $route (to) {
      this.showSuccess = false
      this.updateTemplate()
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

      this.imageSrc = `${TEMPLATES_URL}/${this.templateId}/example${this.templateInfo.extension}`
      this.template = new Template(this.templateId)
    },
    async generate () {
      if (!this.templateInfo) {
        return
      }

      this.imageSrc = await this.template.generate()
      this.showSuccess = true
    },
    saveImage () {
      download(this.imageSrc, `${this.template.name}${this.template.extension}`)
    }
  }
}
</script>
