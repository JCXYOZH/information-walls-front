<template>
  <div class="app-container">
    <el-container>
      <!-- 顶栏容器 -->
      <el-header height="60px;">
        <!-- 公共头 -->
        <myheader />
      </el-header>
      <!-- 分割线 -->
      <!-- 主要区域容器 -->
      <el-main style="padding: 0px; margin-top: 0px">
        <div class="main-container">
          <nuxt />
        </div>
      </el-main>
      <!-- 底栏容器 -->
      <!-- <el-footer>
        <myfooter />
      </el-footer> -->
    </el-container>
  </div>
</template>

<script>
import myheader from "./myheader";
import myfooter from "./myfooter";

export default {
  components: {
    myheader,
    myfooter,
  },
  mounted() {
    // 使用自定义 Image 对象阻止使用 F12 对网页进行信息爬取
    var element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        window.location.href = "https://google.com"; // 重定向到谷歌
      }
    });
    console.log(element);

    // 调试阻止程序
    setInterval(function() {
      check();
    }, 2000);

    var check = function() {
      function doCheck(a) {
        if (('' + a / a)['length'] !== 1 || a % 20 === 0) {
          (function() {}['constructor']('debugger')());
        } else {
          (function() {}['constructor']('debugger')());
        }
        doCheck(++a);
      }
      try {
        doCheck(0);
      } catch (err) {}
    };
    check();
  }
}
</script>

<style>
.el-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.el-main {
  overflow: visible !important;
}
</style>
