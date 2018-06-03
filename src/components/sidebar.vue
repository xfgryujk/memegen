<template>
  <div class="sidebar border-right border-bottom">
    <div class="header border-bottom">
      模板
      <button type="button" v-b-toggle.sidebar-collapse class="float-right d-md-none p-0 ml-3" aria-label="Toggle docs navigation">
        <svg class="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="20" height="20" focusable="false">
          <title>模板列表</title>
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" d="M4 7h22M4 15h22M4 23h22"></path>
        </svg>
      </button>
    </div>
    <b-collapse tag="nav" is-nav vertical visible class="links d-md-block py-3" id="sidebar-collapse">
      <b-nav class="d-block">
        <b-nav-item v-for="(info, id) in templateList" :key="id" :to="`/${id}`">
          {{ info.name }}
        </b-nav-item>
      </b-nav>
    </b-collapse>
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
  margin-left: -15px;
  margin-right: -15px;
}

@media (min-width: 768px) {
  .sidebar {
    height: 100vh;
  }
}

.header {
  position: relative;
  padding: 15px;
  background-color: #fafafa;
}

.header button {
  line-height: 1rem;
}

.links {
  height: calc(100% - 31px - 1.5rem);
  flex-wrap: nowrap;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .links {
    height: 70vh;
  }
}

.links a.active {
  color: black;
}
</style>
