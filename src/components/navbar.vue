<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">memegen</b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item href="#" v-b-modal.about-modal>关于</b-nav-item>
          <b-modal id="about-modal" centered ok-only title="关于">
            <p>
              这是一个在线制作沙雕图（表情图）的web app。受到<a href="https://sorry.xuty.tk/sorry/">在线生成Sorry动图</a>的启发，不过这是完全在前端实现的，在我不知道的时候前端已经变得这么强大了呢。目前只能制作GIF图，以后会加入静态图和更多模板。
            </p>
            <p>
              GIF解码用的是<a href="https://github.com/deanm/omggif">omggif</a>，编码用的是<a href="https://github.com/jnordberg/gif.js">gif.js</a>的优化版。只在Chrome和Edge下测试过，如果不能用请使用最新的Chrome浏览器。
            </p>
            <p>
              作者：xfgryujk。<a href="https://github.com/xfgryujk/memegen">获取源码</a>
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
