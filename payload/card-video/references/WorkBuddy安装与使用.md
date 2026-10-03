# WorkBuddy 安装与使用

本包采用 Skill + 固定初始化脚本，在本机运行，无需自建服务器。将完整 ZIP 导入 WorkBuddy，启用后说：“检查并初始化卡片视频环境，完成后生成安装测试片。”

## 基础环境

入口 `scripts/bootstrap.py` 只用 Python 标准库。Agent 应先探测 python3/python，再发现 WorkBuddy 的 `~/.workbuddy/binaries/python/versions/*/`。Windows 常见可执行文件名为 python.exe，Mac 为 bin/python3。如果连基础 Python 都不存在，使用 WorkBuddy 设置中的运行环境检测安装，随后继续；不能在没有解释器时假装运行过脚本。

脚本优先使用已安装且受支持的 Node；缺失时下载 runtime-lock.json 中指定版本，核对 SHA256 后解压至本技能 `.runtime/node`。Python 包装入 `.runtime/python`，npm 包装入 `node_modules`，浏览器由 Remotion 管理。所有命令使用参数数组，路径包含中文、空格时也不得拼 shell 字符串。

## Agent 调用顺序

下面的 PY 和 SKILL_DIR 都由 Agent 替换为实际绝对路径。

1. `PY SKILL_DIR/scripts/bootstrap.py doctor --json`：只检查，不下载。
2. `PY SKILL_DIR/scripts/bootstrap.py setup`：安装缺失组件，锁定版本。
3. `PY SKILL_DIR/scripts/bootstrap.py smoke --project PROJECT_DIR`：十秒中文动画和合成测试音轨，无收费 API。只证明本地渲染链路，不证明在线配音可用。
4. `PY SKILL_DIR/scripts/bootstrap.py run SCRIPT_JSON --project PROJECT_DIR --tts auto`：完整制作。auto 优先已有 MiniMax 配置，否则 edge-tts。

重复初始化会复用已经符合版本和锁文件要求的组件。损坏环境可 `setup --repair`。Node/npm 不完整可 `setup --managed-node`，准备本技能自己的完整 Node。

每条正式视频使用独立工程目录。输出为 `output.mp4`。默认竖版；横版加 `--landscape`。静音测试需显式 `--tts none --allow-silent`，交付中必须注明没有旁白。

## 配音配置

edge-tts 不要求 MiniMax 账号，但需要网络访问其服务，无法保证第三方服务始终可达。失败时报告具体页码，不把失败音频当作成功。

MiniMax 使用学员自己的账户和额度。Agent 可检查配置是否存在，禁止输出密钥。将 `.env.example` 复制为本机 `.env` 后，由学员在本地文件中填写；或使用 WorkBuddy 当前执行环境已配置的环境变量。不要在群聊或发布包中保存真实凭据。MINIMAX_VOICE_ID 指向学员自己的已授权声音。克隆新声音应在服务平台完成后配置音色 ID；本包不带任何人的声音样本。

## 常见故障

- Node 下载失败：检查 nodejs.org 下载网络，保留失败状态后重试，不跳过校验。
- npm/pip 下载失败：使用已核对可信的网络或镜像，保留锁文件和哈希验证。不得改装任意“最新版”。
- 浏览器失败：重跑 setup；若服务下载不可达，明确提示下载阶段失败。
- 中文乱码：本包已带 Noto Sans SC；确认整个 ZIP 已导入，字体存在于 src/assets。
- 配音清单与文案不匹配：对当前文案重新配音，不能强行使用旧工程音频。
- `.job.lock` 或 `.runtime/setup.lock`：先确认是否还有任务运行。仅在确认对应任务结束后清理遗留锁，再重试。

具体平台是否已经实跑，见同目录《平台验收记录.md》。安装成功、功能测试通过与市场上架成功是三个不同状态。
