# React Bits 首屏动效方案

## 当前接入

首页保留原有标题、行动按钮和快速搜索卡，仅替换首屏背景层。

| 参数 | 效果 | 当前用途 |
| --- | --- | --- |
| `?heroFx=dot` | Dot Field 点阵 | 默认方案，对应 LED 像素和户外屏幕语言 |
| `?heroFx=beams` | Beams 光束 | 活动期备选，模拟屏幕扫描和城市点亮 |
| `?heroFx=waves` | GradientWaves 波浪 | 备选氛围层，压在首屏下半部分 |

增加 `?heroLab=1` 后，可在首屏底部显示效果切换器。正式访问不带参数时默认使用点阵方案。

## 适用判断

- `Dot Field`：适合首屏主背景。低对比点阵不会干扰白色搜索卡，行业指向明确。
- `Beams`：适合首屏，但视觉更戏剧化。当前参数降低了亮度、速度和数量，避免像游戏界面。
- `GradientWaves`：适合首屏底部或后续“媒体资源联动”区域，不适合整屏铺满。
- `Aurora`、`Ribbons`：暂不使用，容易变成通用科技/SaaS 页面，与户外广告业务关联较弱。
- `Line Waves`：适合后续资源网络、投放流程或数据区域。
- `Metallic Paint`：适合单个标题或关键数字，不适合整站背景。

## 实现约束

- WebGL 不可用时保留深蓝 CSS 渐变，标题和搜索卡仍完整可用。
- 系统开启“减少动态效果”时，组件使用静止状态。
- 组件采用动态加载，不增加首页首屏基础包体。
- React Bits 源码及许可证位于 `components/backgrounds/`。

## 视觉检查

- `deliverables/react-bits-hero/dot-desktop-final.png`
- `deliverables/react-bits-hero/beams-desktop-final.png`
- `deliverables/react-bits-hero/waves-desktop-final.png`
- `deliverables/react-bits-hero/dot-mobile-final.png`
- `deliverables/react-bits-hero/dot-no-webgl-fallback.png`
