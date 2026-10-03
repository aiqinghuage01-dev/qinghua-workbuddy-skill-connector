---
name: 卡片视频-学员版
version: 2.1.0
author: 清华哥
description_zh: 把现成文案自动配音并渲染为卡片短视频，含独立环境安装与检查。
description_en: Turn provided copy into narrated card videos with isolated runtime setup and diagnostics.
description: >
  [卡片视频/文案成片/把文案做成视频/文字转视频]→文案自动配音渲染成竖版卡片视频
  不用数字人时，把现成文案或同轮刚生成的文案直接做成卡片式短视频。默认使用 MiniMax 克隆声音配音。
  当用户提到"文案成片""把文案做成视频""文字转视频""卡片视频""自动配音成片""不需要数字人"时触发。
  若当前请求明确提到"数字人/石榴/16AI/分身"，严禁使用本技能，改用 `数字人生成` 或 `数字人成片`。
---

# 文案自动成片

## 执行回执（硬规则）

只要本轮因为 `skill` / `技能` 指名，或因为关键词命中而进入本技能，第一行先写：
`已走技能：卡片视频-学员版`

## 适用场景

- 用户直接给了一段文案，要做成视频
- 上一轮刚用文案 skill 产出文案，这一轮要继续做成视频
- 不需要数字人出镜
- 默认使用 MiniMax 克隆声音配音
- 输出形式为卡片动画成片

**不适用**：
- 明确提到 `数字人` / `石榴` / `16AI` / `分身`
- 用户要的是“数字人口播视频”
- 用户要的是“数字人 + 字幕/BGM/剪辑/卡片叠加的最终成片”

这两类请求分别改走：
- 只生成数字人口播：`数字人生成`
- 数字人剪辑成片：`数字人成片`

## 硬规则

- 只要用户明确提到 `数字人`，立刻退出本技能，不要再走 MiniMax 配音
- 如果请求是“先写文案，再成片”，顺序必须是：
  - 先用匹配的文案 skill 产出最终文案
  - 再把该文案交给本技能
- 如果用户没有提供文案，也没有同轮刚生成的文案，禁止自己编文案
- 默认声音是当前 `.env` 中的 `MINIMAX_VOICE_ID`

## WorkBuddy 学员入口（V2.1，优先执行）

本节是 Windows/macOS 的实际执行入口。下文原有工作流的业务规则继续有效；命令由本节的统一入口承接，不再逐条安装全局依赖。

1. 技能目录以本次加载的 `SKILL.md` 所在目录为准。无法确定时依次查找 `~/Desktop/skills/*/卡片视频-学员版`、`~/.workbuddy/skills/卡片视频-学员版`、`~/.hermes/skills/卡片视频-学员版`。Windows 的 `~` 表示用户主目录，使用当前系统对应的路径写法。
2. 先发现解释器：依次验证 `python3`、`python`，再检查 WorkBuddy 托管的 `~/.workbuddy/binaries/python/versions/*/` 中的解释器，把实际可运行的 Python 3.10+ 记为 `PY`。若都缺失，引导学员在 WorkBuddy「运行环境检测」中安装 Python；禁止假装已安装，也不要要求学员自己编写命令。
3. 由 Agent 使用参数数组执行 `<PY> <技能目录>/scripts/bootstrap.py doctor --json`。首次使用或检查失败时运行 `setup`；它创建独立环境，按锁文件安装依赖。Node 缺失时会校验下载指定版本。初始化后必须再次 `doctor`。
4. 首次安装再执行 `smoke --project <绝对验收目录>`，输出十秒中文动画和测试音轨。它不调用收费 API，也不证明在线配音服务已经可用。
5. 正式成片使用 `run <script.json绝对路径> --project <绝对工程目录> --tts auto`。`auto` 默认优先已配置的 MiniMax，否则用 edge-tts；也可明确 `--tts edge`。每条视频独立目录，不复用其他文案的音频。
6. API 失败先修复或按下文三级降级规则明确告知后使用备用声音。静音保底须在输出中明确标注，并用 `--tts none --allow-silent`，不得声称正常配音完成。
7. 本版默认 1080×1920 竖版；用户明确要横版时追加 `--landscape`。结果位于工程目录的 `output.mp4`。
8. 按 @references/WorkBuddy安装与使用.md 处理安装、配置和故障。包不带任何个人密钥、声音样本和历史项目。发布前以 @references/平台验收记录.md 为准区分实现支持与实际验收。

本节使用的 `<PY>`、`<技能目录>`、`<绝对工程目录>` 都是 Agent 替换的占位符，不直接让学员复制执行。

## 验证安装

```bash
<PY> <技能目录>/scripts/bootstrap.py doctor --json
```

## 配音方案（三级降级）

默认走 MiniMax 克隆声音，没有 API Key 自动降级到免费方案：

```
1. MiniMax 克隆声音（最优）→ 需要 .env 中配置 MINIMAX_API_KEY / GROUP_ID / VOICE_ID
2. edge-tts 免费语音（兜底）→ 不需要任何 API Key，自动使用微软免费语音
3. 静音占位（保底）→ 如果 edge-tts 也不可用，生成无声视频
```

**判断逻辑**：
- 使用统一入口 `run ... --tts auto`；三项 MiniMax 配置完整时优先使用，否则走 edge-tts。
- 配音依赖由 `bootstrap.py setup` 安装到技能独立环境，不运行全局 pip 安装。
- 在线配音失败会返回错误；明确告知用户后选择备用方案。静音保底必须显式使用 `--tts none --allow-silent`，并在交付时标明无配音。

**学员首次使用时**：没有 .env 是正常的，直接走 edge-tts 免费配音即可。
**想升级克隆声音时**：在 MiniMax 平台用本人的声音或已获授权的声音建立音色，再把自己的 API Key、Group ID、Voice ID 填入本机 `.env`；模板见 `.env.example`，不把密钥发到对话或交付包。

## Workflow

### Step 0: 先判断是不是数字人模式

如果当前用户消息出现以下任一表达：
- `数字人`
- `石榴`
- `16AI`
- `分身`

则**禁止继续执行本技能**：
- 只生成数字人视频 -> `数字人生成`
- 数字人最终成片 -> `数字人成片`

### Step 1: 确定文案来源

优先级从高到低：

1. 用户直接贴了完整文案 -> 直接使用
2. 同一轮刚由 `投流文案-学员版` / `录音文案改写` / `热点文案改写V2` 等技能生成了文案 -> 直接复用
3. 用户明确指定了某个现有文案文件 -> 读取后使用

禁止行为：

- 没有文案时自己现场编一版
- 只因为用户提到行业，就自动写一版文案再继续成片

### Step 2: 生成 script JSON

把文案拆成独立工程目录中的 `script.json`，每页至少包含：

- `lines`
- `narration`
- `duration`

排版规则：

- 长文本不要整段塞进 `gradient`
- `gradient` 只用于短关键句
- 长句拆成 `title / body / emphasis`

### Step 3: 生成配音（自动选择方案）

使用统一入口，先配音再渲染：

```text
<PY> <技能目录>/scripts/bootstrap.py run <script.json绝对路径> --project <绝对工程目录> --tts auto
```

配音清单写入该工程的 `public/audio/manifest.json`，绑定当前文案指纹；配音失败不能复用旧清单冒充成功。

### Step 4: 渲染成片

Step 3 的统一入口已完成渲染和尺寸、音轨验收，无需再运行第二次。默认竖版；横版追加 `--landscape`。交付前仍需抽帧检查中文显示、排版和听检配音。

### Step 5: 返回结果

成功后返回：

- 使用的文案来源
- 实际配音方案及声音名称（不回显密钥）
- script JSON 路径
- 最终视频路径

默认输出目录：

- `<绝对工程目录>/output.mp4`

## 快速路径

环境 doctor 通过、文案已准备好时：

```text
<PY> <技能目录>/scripts/bootstrap.py run <script.json绝对路径> --project <绝对工程目录> --tts auto
```
