<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">memegen</b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item href="#" v-b-modal.about-modal>关于</b-nav-item>
          <b-modal id="about-modal" centered ok-only title="关于">
            <p>
              WIP
            </p>
          </b-modal>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: 'memegen-navbar'
};
</script>
