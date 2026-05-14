# 神兽 UI 美化设计文档

## 概述

**目标**: 优化青龙和白虎的 SVG 形态，添加精细细节和元素粒子动画，达到类似宝可梦的中度可爱风格。

**范围**: 青龙（木元素）、白虎（金元素）

**方案**: 纯 SVG + CSS 动画，无外部依赖

---

## 青龙形态设计

### 形态风格
- 中度可爱风格，圆润龙身
- 头大身长尾细，整体比例：头 40%，身体 50%，尾巴 10%
- 类似宝可梦龙类造型

### 细节元素

| 元素 | 描述 |
|------|------|
| 龙角 | 小巧分叉，位于头顶两侧，三角形 + 小分支 |
| 龙须 | 两根细长线条从嘴边延伸，微微弯曲 |
| 龙鳞 | 身体上添加小圆形/半圆形纹理，分布稀疏可爱 |
| 龙爪 | 四肢用小椭圆表示，爪尖用小三角形 |
| 眼睛 | 大而圆，有瞳孔和光泽点 |

### 配色方案
- 主体：木元素渐变（浅绿 #81C784 → 深绿 #388E3C）
- 眼睛：翡翠绿色 #66BB6A
- 龙角/龙须：深绿色 #2E7D32
- 龙鳞：浅绿色半透明 rgba(129, 199, 132, 0.3)

### 阶段变化

| 阶段 | 形态特征 |
|------|----------|
| 幼年期 | 小龙头，短身体，无鳞片，大眼睛 |
| 成年期 | 龙身变长，角出现，少量鳞片 |
| 进化期 | 身体更大，角分叉，鳞片增多，尾巴更长 |
| 神圣期 | 最大尺寸，角华丽，鳞片覆盖全身，神圣光环 |

---

## 白虎形态设计

### 形态风格
- 中度可爱风格，圆润虎头虎身
- 虎头较大，身体健壮，尾巴粗壮摇摆
- 整体比例：头 35%，身体 55%，尾巴 10%

### 细节元素

| 元素 | 描述 |
|------|------|
| 虎纹 | 额头王字纹 + 身体条纹（黑色线条，卡通化处理） |
| 虎耳 | 圆形耳朵，内部粉色 |
| 虎牙 | 两颗小獠牙从嘴角露出，可爱不凶猛 |
| 虎爪 | 圆润四肢，爪子用小圆形表示 |
| 尾巴 | 粗壮尾巴，末端有虎纹，微微摇摆 |

### 配色方案
- 主体：白色渐变（浅灰 #E0E0E0 → 深灰 #9E9E9E）
- 眼睛：金色瞳孔 #FFD700
- 虎纹：深灰色线条 #424242
- 虎耳内侧：粉色 #F8BBD9

### 阶段变化

| 阶段 | 形态特征 |
|------|----------|
| 幼年期 | 小虎头，圆身体，少量虎纹，大眼睛 |
| 成年期 | 虎身变大，虎纹增多，獠牙出现 |
| 进化期 | 更大体型，虎纹覆盖全身，威猛姿态 |
| 神圣期 | 最大尺寸，金属光泽毛发，神圣光环 |

---

## 元素装饰动画设计

### 木元素 - 叶片粒子环绕（青龙）

#### 粒子参数
- 数量：幼年 4-6，成年 6-8，进化 10-12，神圣 12+
- 形状：椭圆形叶片 + 尖端，绿色渐变
- 分布：身体上方和两侧随机位置

#### 动画效果
- 飘落动画：从上方缓慢飘落，左右轻微摆动
- 环绕动画：围绕龙身旋转一圈后消失
- 透明度：生成 0→1，消失 1→0

#### CSS 关键帧
```scss
@keyframes leaf-float {
  0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(10px) translateX(15px) rotate(45deg); }
  90% { opacity: 0.6; }
  100% { transform: translateY(30px) translateX(-10px) rotate(90deg); opacity: 0; }
}
```

### 金元素 - 金色光点飘落（白虎）

#### 粒子参数
- 数量：幼年 6-8，成年 8-10，进化 12-15，神圣 15+
- 形状：圆形 + 发光效果（blur + glow）
- 分布：虎身上方和周围随机位置

#### 动画效果
- 飘落动画：从上方飘落，带有闪烁
- 闪烁动画：透明度周期性变化，星光感
- 消失动画：飘落一定高度后渐隐

#### CSS 关键帧
```scss
@keyframes gold-sparkle {
  0% { transform: translateY(-30px) scale(0.5); opacity: 0; }
  20% { opacity: 1; transform: translateY(-10px) scale(1); }
  50% { opacity: 0.6; }
  70% { opacity: 1; }
  100% { transform: translateY(20px) scale(0.3); opacity: 0; }
}

@keyframes sparkle-flash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5); }
}
```

---

## 技术实现架构

### 文件结构

保持现有 BeastAvatar.vue 结构，增强以下部分：

```
BeastAvatar.vue
├── template
│   ├── 背景光环（现有）
│   ├── 神兽SVG主体（增强）
│   │   ├── 身体路径
│   │   ├── 龙角/虎耳
│   │   ├── 龙须/虎纹
│   │   ├── 龙鳞/虎牙
│   │   ├── 四肢爪子
│   │   └── 尾巴
│   ├── 眼睛（现有，调整位置）
│   ├── 元素粒子层（新增）
│   │   ├── leaf-particles（叶片容器）
│   │   └── gold-particles（光点容器）
│   └── 神圣期特效（现有）
│
├── script setup
│   ├── beastPaths（重写）
│   │   ├── dragonPaths: 青龙精细路径
│   │   └── tigerPaths: 白虎精细路径
│   ├── particleConfig（新增）
│   │   ├── leafCount: computed 叶片数量
│   │   ├── goldCount: computed 光点数量
│   │   ├── leafPositions: 叶片随机位置数组
│   │   ├── goldPositions: 光点随机位置数组
│   └── eyePositionsMap（调整）
│
└── style scoped
│   ├── 神兽基础样式（现有）
│   ├── 元素特色动画（现有）
│   ├── 粒子动画（新增）
│   │   ├── .leaf-particles
│   │   ├── .leaf
│   │   ├── @keyframes leaf-float
│   │   ├── .gold-particles
│   │   ├── .sparkle
│   │   ├── @keyframes gold-sparkle
│   │   ├── @keyframes sparkle-flash
│   └── 细节样式（新增）
│       ├── .dragon-horn
│       ├── .dragon-whisker
│       ├── .dragon-scale
│       ├── .tiger-stripe
│       ├── .tiger-ear
│       ├── .tiger-tooth
```

### SVG 路径设计方法

**青龙路径构建：**
- 龙头：圆形基础（ellipse） + 修饰曲线（path）
- 龙角：三角形 path + 分叉小三角
- 龙须：曲线 path，从嘴边向两侧延伸
- 龙身：贝塞尔曲线勾勒圆润身体轮廓
- 龙鳞：多个小圆形叠加，分布沿身体曲线
- 龙尾：曲线延伸，末端渐变缩小
- 四肢：椭圆 + 三角爪尖

**白虎路径构建：**
- 虎头：圆形基础 + 下颚曲线
- 虎耳：圆形 + 内部粉色圆形
- 虎纹：多条 path 线条（额头王字 + 身体横向条纹）
- 虎身：圆润轮廓曲线，略呈椭圆形
- 虎牙：小三角形从嘴角下方伸出
- 虎尾：粗壮曲线 + 条纹 path
- 四肢：椭圆爪子

### 粒子组件实现

```vue
<!-- 叶片粒子层 -->
<div class="leaf-particles" v-if="element === 'wood'">
  <svg 
    class="leaf" 
    v-for="i in leafCount" 
    :key="'leaf-' + i"
    viewBox="0 0 10 16"
    :style="{
      '--delay': (i * 0.4) + 's',
      '--x-offset': leafPositions[i - 1] + 'px',
      '--duration': (2 + Math.random() * 1) + 's'
    }"
  >
    <defs>
      <linearGradient id="leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#81C784"/>
        <stop offset="100%" style="stop-color:#388E3C"/>
      </linearGradient>
    </defs>
    <ellipse cx="5" cy="8" rx="4" ry="7" fill="url(#leaf-gradient)"/>
  </svg>
</div>

<!-- 金点粒子层 -->
<div class="gold-particles" v-if="element === 'metal'">
  <div 
    class="sparkle" 
    v-for="i in goldCount" 
    :key="'sparkle-' + i"
    :style="{
      '--delay': (i * 0.25) + 's',
      '--x-offset': goldPositions[i - 1] + 'px',
      '--duration': (1.5 + Math.random() * 0.5) + 's'
    }"
  />
</div>
```

---

## 实现步骤

1. **重写 SVG 路径数据**
   - 设计青龙 4 阶段精细 SVG 路径
   - 设计白虎 4 阶段精细 SVG 路径
   - 更新 beastPaths 数据结构

2. **调整眼睛位置**
   - 根据新形态调整 eyePositionsMap
   - 确保眼睛位置与新龙头/虎头匹配

3. **新增粒子配置**
   - 添加 leafCount / goldCount computed 属性
   - 添加 leafPositions / goldPositions 随机位置生成

4. **添加粒子模板**
   - 在 template 中添加粒子容器
   - 使用 v-if 根据元素类型显示

5. **编写粒子动画样式**
   - 添加 .leaf-particles / .gold-particles 容器样式
   - 添加 .leaf / .sparkle 粒子样式
   - 添加 @keyframes 动画定义

6. **添加细节样式**
   - 龙角、龙须、龙鳞样式
   - 虎纹、虎耳、虎牙样式

---

## 工作量预估

| 任务 | 预估时间 |
|------|----------|
| SVG 路径设计与绘制 | 1.5 小时 |
| 粒子动画实现 | 0.5 小时 |
| 样式调整与调试 | 0.5 小时 |
| 总计 | 2-3 小时 |

---

## 参考

- 风格参考：宝可梦龙类/虎类造型，中度可爱
- 技术参考：现有 BeastAvatar.vue SVG + CSS 动画架构
- 动画参考：阴阳师神兽元素环绕效果