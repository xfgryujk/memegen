<template>
  <div class="sidebar">
    <div class="header">
      模板
    </div>
    <b-nav vertical>
      <b-nav-item v-for="(info, id) in templateList" :key="id" :to="`/${id}`">
        {{ info.name }}
      </b-nav-item>
    </b-nav>
  </div>
</template>

<script>
import templateList from '../templateList'

export default {
  name: 'sidebar',
  data () {
    return {
      templateList: templateList
    }
  }
};
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
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
  height: calc(100% - 31px - 1.5rem);
  flex-wrap: nowrap;
  overflow-y: scroll;
}

a.active {
  color: black;
}
</style>
