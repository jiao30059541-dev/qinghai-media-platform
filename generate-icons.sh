#!/bin/bash
# 图标生成脚本 for 青海全媒体广告平台

ICON_DIR="/opt/qinghai-media-platform/public/icons"
SCREENSHOTS_DIR="/opt/qinghai-media-platform/public/screenshots"

# 创建目录
mkdir -p "$ICON_DIR"
mkdir -p "$SCREENSHOTS_DIR"

# 检查是否安装了ImageMagick
if ! command -v convert &> /dev/null; then
    echo "警告: ImageMagick未安装，将创建SVG图标"
    USE_SVG=true
else
    USE_SVG=false
fi

# 创建favicon.ico (16x16, 32x32)
if [ "$USE_SVG" = false ]; then
    # 使用ImageMagick创建
    convert -size 16x16 xc:#0f172a -fill "#0ea5e9" -draw "circle 8,8 12,12" "$ICON_DIR/favicon.ico"
    convert -size 32x32 xc:#0f172a -fill "#0ea5e9" -draw "circle 16,16 28,28" -resize 32x32 "$ICON_DIR/icon-32x32.png"
else
    # 创建SVG版本
    cat > "$ICON_DIR/favicon.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <rect width="16" height="16" fill="#0f172a"/>
  <circle cx="8" cy="8" r="6" fill="#0ea5e9"/>
</svg>
EOF
    # 复制为favicon.ico（实际上还是SVG）
    cp "$ICON_DIR/favicon.svg" "$ICON_DIR/favicon.ico"
fi

# 图标尺寸列表
SIZES="72 96 128 144 152 192 384 512"

for size in $SIZES; do
    if [ "$USE_SVG" = false ]; then
        # 使用ImageMagick创建PNG图标
        convert -size ${size}x${size} xc:#0f172a \
                -fill "#0ea5e9" \
                -draw "circle $((size/2)),$((size/2)) $((size-4)),$((size-4))" \
                -font Arial -pointsize $((size/4)) \
                -fill white -gravity center \
                -annotate 0 "青" \
                "$ICON_DIR/icon-${size}x${size}.png"
    else
        # 创建SVG图标
        cat > "$ICON_DIR/icon-${size}x${size}.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0f172a" rx="${size/8}"/>
  <circle cx="$((size/2))" cy="$((size/2))" r="$((size/3))" fill="#0ea5e9"/>
  <text x="$((size/2))" y="$((size/2))" text-anchor="middle" dy=".3em" 
        font-family="Arial, sans-serif" font-size="$((size/4))" 
        fill="white" font-weight="bold">青</text>
</svg>
EOF
        # 如果需要PNG，可以尝试转换（如果安装了rsvg-convert）
        if command -v rsvg-convert &> /dev/null; then
            rsvg-convert -w $size -h $size "$ICON_DIR/icon-${size}x${size}.svg" \
                         -o "$ICON_DIR/icon-${size}x${size}.png"
        fi
    fi
done

# 创建苹果触摸图标
if [ "$USE_SVG" = false ]; then
    convert -size 180x180 xc:#0f172a \
            -fill "#0ea5e9" \
            -draw "circle 90,90 170,170" \
            -font Arial -pointsize 45 \
            -fill white -gravity center \
            -annotate 0 "青" \
            "$ICON_DIR/apple-touch-icon.png"
    
    # 复制为其他苹果图标尺寸
    cp "$ICON_DIR/apple-touch-icon.png" "$ICON_DIR/icon-152x152.png"
    cp "$ICON_DIR/apple-touch-icon.png" "$ICON_DIR/icon-180x180.png"
else
    cat > "$ICON_DIR/apple-touch-icon.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#0f172a" rx="30"/>
  <circle cx="90" cy="90" r="60" fill="#0ea5e9"/>
  <text x="90" y="90" text-anchor="middle" dy=".3em" 
        font-family="Arial, sans-serif" font-size="45" 
        fill="white" font-weight="bold">青</text>
</svg>
EOF
fi

# 创建其他图标
if [ "$USE_SVG" = false ]; then
    # 浏览图标
    convert -size 96x96 xc:#0f172a \
            -fill "#0ea5e9" \
            -draw "rectangle 20,20 76,76" \
            -font Arial -pointsize 24 \
            -fill white -gravity center \
            -annotate 0 "浏" \
            "$ICON_DIR/browse-icon.png"
    
    # AI图标
    convert -size 96x96 xc:#0f172a \
            -fill "#0ea5e9" \
            -draw "polygon 48,20 76,76 20,76" \
            -font Arial -pointsize 24 \
            -fill white -gravity center \
            -annotate 0 "AI" \
            "$ICON_DIR/ai-icon.png"
    
    # 购物车图标
    convert -size 96x96 xc:#0f172a \
            -fill "#0ea5e9" \
            -draw "circle 48,48 90,90" \
            -draw "circle 70,30 10,10" \
            -font Arial -pointsize 24 \
            -fill white -gravity center \
            -annotate 0 "车" \
            "$ICON_DIR/cart-icon.png"
else
    # 创建SVG版本的其他图标
    cat > "$ICON_DIR/browse-icon.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="#0f172a" rx="20"/>
  <rect x="20" y="20" width="56" height="56" fill="#0ea5e9" rx="10"/>
  <text x="48" y="48" text-anchor="middle" dy=".3em" 
        font-family="Arial, sans-serif" font-size="24" 
        fill="white" font-weight="bold">浏</text>
</svg>
EOF
fi

# 创建占位截图
if [ "$USE_SVG" = false ]; then
    # 桌面截图
    convert -size 1920x1080 gradient:#0f172a-#1e293b \
            -font Arial -pointsize 72 \
            -fill white -gravity center \
            -annotate 0 "青海全媒体广告平台\n桌面版截图" \
            "$SCREENSHOTS_DIR/home-desktop.png"
    
    # 移动端截图
    convert -size 750x1334 gradient:#0f172a-#1e293b \
            -font Arial -pointsize 36 \
            -fill white -gravity center \
            -annotate 0 "青海全媒体广告平台\n移动端截图" \
            "$SCREENSHOTS_DIR/home-mobile.png"
else
    # 创建SVG截图占位
    cat > "$SCREENSHOTS_DIR/home-desktop.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#gradient)"/>
  <text x="960" y="540" text-anchor="middle" dy=".3em" 
        font-family="Arial, sans-serif" font-size="72" 
        fill="white" font-weight="bold">
    <tspan x="960" dy="-40">青海全媒体广告平台</tspan>
    <tspan x="960" dy="80">桌面版截图</tspan>
  </text>
</svg>
EOF
    
    cat > "$SCREENSHOTS_DIR/home-mobile.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1334" viewBox="0 0 750 1334">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="750" height="1334" fill="url(#gradient)"/>
  <text x="375" y="667" text-anchor="middle" dy=".3em" 
        font-family="Arial, sans-serif" font-size="36" 
        fill="white" font-weight="bold">
    <tspan x="375" dy="-30">青海全媒体广告平台</tspan>
    <tspan x="375" dy="60">移动端截图</tspan>
  </text>
</svg>
EOF
fi

# 创建浏览器配置文件
cat > "/opt/qinghai-media-platform/public/browserconfig.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/icons/icon-72x72.png"/>
      <square150x150logo src="/icons/icon-144x144.png"/>
      <square310x310logo src="/icons/icon-310x310.png"/>
      <wide310x150logo src="/icons/icon-310x150.png"/>
      <TileColor>#0f172a</TileColor>
    </tile>
  </msapplication>
</browserconfig>
EOF

# 创建Safari固定标签图标
cat > "/opt/qinghai-media-platform/public/safari-pinned-tab.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <path fill="#0ea5e9" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z"/>
  <path fill="#0f172a" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
</svg>
EOF

# 设置权限
chmod -R 755 "$ICON_DIR"
chmod -R 755 "$SCREENSHOTS_DIR"

echo "✅ 图标生成完成"
echo "📁 图标目录: $ICON_DIR"
echo "📁 截图目录: $SCREENSHOTS_DIR"
echo ""
echo "生成的文件:"
ls -la "$ICON_DIR"
echo ""
echo "如果缺少PNG文件，请安装:"
echo "  Ubuntu/Debian: apt-get install imagemagick librsvg2-bin"
echo "  CentOS/RHEL: yum install ImageMagick rsvg-convert"
echo "  macOS: brew install imagemagick librsvg"