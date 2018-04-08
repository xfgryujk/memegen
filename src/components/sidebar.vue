<template>
  <div class="sidebar">
    <div class="header">
      模板
    </div>
    <b-nav vertical>
      <b-nav-item v-for="(tpl, id) in templates" :key="id" :to="`/${id}`">
        {{ tpl.name }}
      </b-nav-item>
    </b-nav>
  </div>
</template>

<script>
import templates from '../templates'

export default {
  name: 'sidebar',
  data () {
    return {
      templates: templates
    }
  }
};
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.07);
}

.sidebar .header {
  position: relative;
  padding: 15px;
  margin-left: -15px;
  background-color: #fafafa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.sidebar .nav {
  height: 100vh;
  flex-wrap: nowrap;
  overflow-y: scroll;
}
</style>
