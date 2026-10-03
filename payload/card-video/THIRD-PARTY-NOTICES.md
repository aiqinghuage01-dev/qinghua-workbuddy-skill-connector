# 第三方组件

- Noto Sans SC 字体：Google Fonts 的 ofl/notosanssc，https://github.com/google/fonts/tree/main/ofl/notosanssc 。原始字体随包保留，许可见 src/assets/OFL.txt。
- Node.js：初始化时从 https://nodejs.org/dist/ 下载，版本和 SHA256 固定在 runtime-lock.json。下载包包含上游 LICENSE。
- Remotion/React：由 npm 按 package-lock.json 安装，许可证保留于相应 node_modules 包。Remotion 的使用条件见 https://www.remotion.dev/license ，不要将本技能的许可等同于所有第三方组件许可。
- edge-tts 及依赖：由 pip 按 requirements-runtime.txt 安装，许可证随依赖保留。项目 https://github.com/rany2/edge-tts 。在线语音服务的可用性由第三方决定。

本发布包只分发技能代码、模板和获准分发的字体，不包含已安装的第三方运行环境。
