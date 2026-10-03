---
name: 清华哥技能助手
description: 在WorkBuddy中检查、初始化、修复卡片视频环境并制作视频，安装与制作任务在本机后台执行。
---

# 清华哥技能助手

用户使用本连接器时，先 `list_skills` 了解真实支持范围，首版仅卡片视频学员版。不能把真人精剪、数字人精剪、白板等列为已支持。

## 环境检查与安装

1. `check_environment`：只读，未部署时返回 `initialize_skill`。
2. 用户要求开始使用技能或安装环境时，调用 `initialize_skill`。返回的是 jobId，不是安装成功。
3. `get_task_status({jobId})` 查看进度，通常间隔15～30秒。不要密集轮询。只有 completed 且环境检查通过才告知已安装。
4. 失败时先查看 error / logTail。需要修复时调用 `repair_skill`，它恢复固定版本代码与字体、依赖，保留本机凭据与成片。不得手工删除仍有活进程的锁。
5. `create_test_video` 生成十秒中文卡片动画与测试音轨；不调用付费API。完成后的 path 是本机 MP4。它只验证本地渲染，不验证在线配音。
6. WorkBuddy 重启后用 `list_tasks` 找已有任务，再查询，不重复启动。

## 使用卡片视频

先确认文案已经确定。`get_skill_guide` 提供 JSON 示例。`render_card_video` 参数：

- script.slides：1～30页；每页 lines 为1～8行，每行text不超过150字符，style可为title/body/emphasis。
- 每页 narration 是实际配音文本，1～1000字符；duration 可选。
- landscape：默认 false（竖版），true为横版。

本工具只使用免费在线配音，配音文本会发送给在线服务，视频保存在本机。不具备付费配音与数字人能力。返回后台 jobId，等 completed 再展示 result.path。失败不能把旧文件当成新视频交付。

## 诚实反馈

Windows x64、Intel Mac、Linux 尚待实机验收；不要把分支实现说成全部平台已跑过。需要网络下载安装，不承诺离线或所有网络可达。技能代码在 ~/.qinghua-skills，通过本连接器使用，未自动注册到独立技能市场。

不输出凭据，不要求用户把真实密钥发到群聊；不执行任意 shell，不安装“最新版”替代固定版本，不迁移本人声音、头像与历史项目。
