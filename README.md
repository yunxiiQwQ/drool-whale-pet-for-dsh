# Drool Whale Pet for DSH

[English](README.en.md) | 中文

## 预览

<p align="center">
  <img src="preview/pet-working.png" width="660" alt="鲸鱼桌宠显示 DSH 任务状态">
</p>

## 下载说明

适用于 DSH Web UI 和 Windows 10/11 x64。安装前请完全退出 DSH，包括托盘进程。

[下载 ZIP](https://github.com/yunxiiQwQ/drool-whale-pet-for-dsh/archive/refs/heads/main.zip)，解压后在项目目录打开 PowerShell；也可以使用 Git：

```powershell
git clone https://github.com/yunxiiQwQ/drool-whale-pet-for-dsh.git
cd drool-whale-pet-for-dsh
```

安装并启动：

```powershell
dsh plugin --profile web add .
dsh --profile web
```

桌宠启动后，可在 **设置 → 插件 → 插件配置 → 鲸鱼桌宠** 中调整大小、气泡和动态效果，也可以使用工作区右下角的鲸鱼按钮即时启停。

桌面端使用 `dsh plugin --profile desktop add .` 安装后，从桌面快捷方式启动 DSH。桌宠菜单中的“打开 DSH”会唤起桌面窗口。

Windows 下，若 Low 完整性标签导致 helper 无法创建临时目录，插件会检测标签并自动使用 `%USERPROFILE%\AppData\LocalLow\DSH\drool-whale-pet` 重试，该目录也用于保存桌宠布局。显式配置的 `DSH_DROOL_WHALE_LAYOUT_PATH` 仍优先使用，需指向 Low 进程可写的位置。

启动诊断保存在 `%LOCALAPPDATA%\DSH\drool-whale-pet\helper-startup.json`，记录启动时间、ready 状态、退出码及最多 4096 字符的启动 stderr。成功恢复后会保留首次失败记录，便于排查。更新时先完全退出 DSH，在仓库目录运行 `git pull`，再启动 DSH。

卸载：

```powershell
dsh plugin --profile web remove @dsh-external/dsh-client-plugin-drool-whale-pet
```

## 动作表格

| 预览 | 动作 | 触发条件 |
| --- | --- | --- |
| <img src="assets/pet/01-idle.png" width="72" alt="待机"> | 待机 | DSH 没有正在处理的会话 |
| <img src="assets/pet/16-sleeping.png" width="72" alt="休眠"> | 休眠 | DSH 连接断开 |
| <img src="assets/pet/03-thinking.png" width="72" alt="思考"> | 思考 | 新任务开始或 Agent 正在分析 |
| <img src="assets/pet/06-working.png" width="72" alt="工作"> | 工作 | Agent 编辑文件或调用普通工具 |
| <img src="assets/pet/07-loading.png" width="72" alt="查找"> | 查找 | Agent 搜索、读取或打开内容 |
| <img src="assets/pet/12-uploading.png" width="72" alt="执行命令"> | 执行命令 | Agent 使用 Shell、终端或 PowerShell |
| <img src="assets/pet/14-playing.png" width="72" alt="验证"> | 验证 | Agent 执行测试、检查、构建或 Lint |
| <img src="assets/pet/18-please.png" width="72" alt="等待确认"> | 等待确认 | Agent 提问、请求审批或任务被阻塞 |
| <img src="assets/pet/08-success.png" width="72" alt="成功"> | 成功 | 任务完成时短暂播放 |
| <img src="assets/pet/09-error.png" width="72" alt="错误"> | 错误 | 工具或任务失败时播放 |
| <img src="assets/pet/11-dragging.png" width="72" alt="拖动"> | 拖动 | 按住桌宠并移动 |
| <img src="assets/pet/02-happy.png" width="72" alt="摸头"> | 摸头 | 单击头部或双击桌宠 |
| <img src="assets/pet/05-surprised.png" width="72" alt="戳一戳"> | 戳一戳 | 单击身体区域 |
| <img src="assets/pet/17-angry.png" width="72" alt="碰尾巴"> | 碰尾巴 | 单击尾巴区域 |
| <img src="assets/pet/04-confused.png" width="72" alt="空闲小动作"> | 空闲小动作 | 空闲时随机播放惊讶、困惑或吃东西 |

## 声明

- 插件只响应 DSH 会话事件，不读取密钥、不截图、不发送遥测。
- 配置端点只接受本机同源请求，不新增网络监听端口。
- 项目代码采用 [BSD-3-Clause](LICENSE) 许可证。
- Companion 桥接和 Python runtime 基于 [QCYTSN/dsh-dafeiyu](https://github.com/QCYTSN/dsh-dafeiyu)（MIT）；动画素材归属与完整第三方许可见 [NOTICE](NOTICE)。
