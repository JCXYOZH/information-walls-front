<template>
  <div class="publish-content">
    <el-row>
      <el-col :span="8" :xs="20">
        <el-dialog title="快捷发布" :visible.sync="dialog" width="600px;">
          <div>
            <div>
              <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 10 }"
                  placeholder="请输入内容"
                  v-model="contentParam.content"
                  maxlength="500"
                  show-word-limit
              >
              </el-input>
              <div class="woo-box-flex woo-box-alignCenter">
                <div class="woo-box-item-flex" style="align-self: center">
                  <!-- 分类 -->
                  <div class="woo-box-item-inlineBlock">
                    <el-cascader
                        size="small"
                        placeholder="请选择分类"
                        v-model="cascader"
                        :options="categoryOptions"
                        :props="props"
                        class="c-cascader"
                    ></el-cascader>
                  </div>

                  <div class="woo-box-item-inlineBlock">
                    <el-button
                        type="text"
                        @click="selectPicture()"
                        :disabled="disabled.picture"
                    >
                      <svg-icon
                          class="woo-font woo-font--emotico"
                          style="width: 18px; height: 18px"
                          icon-class="picture"
                      />
                      <span class="iconbed-text">图片</span>
                    </el-button>
                  </div>
                  <div class="woo-box-item-inlineBlock">
                    <el-button
                        type="text"
                        @click="selectVideo()"
                        :disabled="disabled.video"
                    >
                      <svg-icon
                          class="woo-font woo-font--emotico"
                          style="width: 18px; height: 18px"
                          icon-class="video"
                      />
                      <span class="iconbed-text">视频</span>
                    </el-button>
                  </div>
                </div>
                <el-button
                    type="primary"
                    round
                    style="margin-top: 15px"
                    :disabled="contentParam.content.length <= 0"
                    @click="publishContent"
                >
                  发布
                </el-button>
              </div>
              <el-upload
                  style="height: 15px"
                  :headers="upload.headers"
                  v-show="upload.show"
                  ref="upload"
                  :limit="upload.limit"
                  :action="upload.action"
                  :show-file-list="true"
                  :list-type="upload.listType"
                  :accept="upload.accept"
                  :auto-upload="false"
                  :on-change="handleChange"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-exceed="handleExceed"
                  :on-success="handleSuccess"
                  :on-error="handleError"
              >
                <button id="uploadBtn" v-show="false"></button>
              </el-upload>
            </div>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 引入接口定义的js文件
import operateApi from "@/api/operate";
import userInfoApi from "@/api/userInfo";
import touristApi from "@/api/tourist";
import { getToken } from "@/utils/auth";

export default {
  data() {
    return {
      // 分类
      props: {
        expandTrigger: "hover",
        value: "categoryId",
        label: "categoryName",
        children: "children",
      },
      // 请求参数
      contentParam: {
        categoryId: "",
        type: 0,
        isAnonymous: 0,
        content: "",
        fileList: [],
      },
      // 禁用
      disabled: {
        picture: false,
        video: false,
      },
      // 上传参数
      upload: {
        show: false,
        action: "",
        limit: 3,
        accept: "",
        listType: "",
        headers: {},
      },
      // 选择的分类
      cascader: [],
      fileCount: 0,
      fileList: [],
      // 分类列表
      categoryOptions: [],
      dialog: true,
      // 1图片, 2视频
      selectType: 0,
    };
  },
  created() {
    if (getToken() === undefined) {
      this.$router.push({ path: "/userlogin" });
    }
    this.upload.headers["Authorization"] = "Bearer " + getToken();
    this.haveMail();
  },
  mounted() {
    this.$nextTick(function () {
      // 确保getTreeselect在mounted之后调用
      this.getTreeselect();
    });
  },

  methods: {
    // 检查内容是否有不文明的语言
    containsBadLanguage(content) {
      const badWords = ['下三烂', '下贱', '仆街','你她马的','你它马的','你他马的','他奶奶的',
        '你是鸡','你是鸭','你马的','奸你','她妈的','她马的','妈B','妈比','妈逼','懆您妈','操逼',
        '日你','仆街','傻逼','脑残','赛你老母','操比','操您妈','你娘咧','灨你娘','操机掰','你老母'];  // 不文明词汇
      const regex = new RegExp(badWords.join('|'), 'i');
      return regex.test(content);
    },

    // 获取分类列表
    getTreeselect() {
      touristApi.getCategoryList().then((response) => {
        let lists = response.data;

        for (let i = 0; i < lists.length; i++) {
          if (lists[i].type == "Y") {
            lists.splice(i, 1);
          }
        }
        this.categoryOptions = this.handleTree(lists, "categoryId");
      });
    },

    // 发布内容
    publishContent() {
      if (this.containsBadLanguage(this.contentParam.content)) {
        this.$message.error('请修改您的内容，避免使用不文明语言。');
        return;
      }

      this.contentParam.fileList = [];
      console.log(this.fileList);
      for (let file of this.fileList) {
        if (file.raw.type.startsWith("image")) {
          this.contentParam.type = 1;
        }
        if (file.raw.type.startsWith("video")) {
          this.contentParam.type = 2;
        }
        if (file.response !== undefined && file.response.code == 200) {
          this.contentParam.fileList.push(file.response.data.fileId);
        } else {
          console.log("禁止");
        }
      }
      if (this.cascader.length != 2) {
        this.$message.warning("请选择分类");
        return;
      } else {
        this.contentParam.categoryId = this.cascader[1];
      }

      // 请求
      operateApi.publishContent(this.contentParam).then((response) => {
        this.$message.success("发表成功，请等待管理的审核");
        this.$router.push({ path: "/User/management?types=1" });
      });
    },

    // 选择图片
    selectPicture() {
      this.upload.action = this.handleCampusUrl("/campus/imageUpload");
      this.upload.limit = 3;
      this.upload.accept = "image/*";
      this.upload.listType = "picture-card";
      this.selectType = 1;
      document.getElementById("uploadBtn").click();
    },
    // 选择视频
    selectVideo() {
      console.log("选择视频");
      this.upload.action = this.handleCampusUrl("/campus/videoUpload");
      this.upload.limit = 1;
      this.upload.accept = "video/*";
      this.upload.listType = "text";
      this.selectType = 2;
      document.getElementById("uploadBtn").click();
    },

    // 检查邮箱
    haveMail() {
      userInfoApi
          .haveMail()
          .then((response) => {})
          .catch((response) => {
            var count = 3; //赋值多少秒
            var times = setInterval(() => {
              count--; //递减
              if (count <= 0) {
                clearInterval(times);
                this.$router.push({ path: "/user/profile" });
              } else {
                this.$message.warning(
                    "将再 " + count + " 秒后跳转到绑定邮箱页面"
                );
              }
            }, 1000); //1000毫秒后执行
          });
    },
  },
};
</script>

<style scoped>
.iconbed-text {
  margin: 0 8px 0 2px;
  font-size: 13px;
}
.c-cascader {
  border-radius: 0;
}
</style>
