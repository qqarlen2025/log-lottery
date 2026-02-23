#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 开始构建 File 模式...\n')

// 1. 清理旧构建
console.log('📦 清理旧构建...')
if (fs.existsSync('dist-file')) {
  fs.rmSync('dist-file', { recursive: true })
}

// 2. 执行构建
console.log('🔨 执行 Vite 构建...')
try {
  execSync('npm run build:file:raw', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ 构建失败')
  process.exit(1)
}

// 3. 复制必要资源
console.log('📋 复制必要资源...')
const copyFiles = [
  { from: 'public/dog.svg', to: 'dist-file/dog.svg' },
]

copyFiles.forEach(({ from, to }) => {
  if (fs.existsSync(from)) {
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.copyFileSync(from, to)
    console.log(`  ✓ ${from} -> ${to}`)
  } else {
    console.log(`  ⚠ ${from} 不存在，跳过`)
  }
})

// 4. 生成使用说明
console.log('📝 生成使用说明...')
const readme = `# Log-Lottery File 模式使用说明

## 启动方式

### Windows
1. 双击 \`index.html\` 文件
2. 或右键选择 "打开方式" -> "Google Chrome" / "Microsoft Edge"

### macOS/Linux
1. 在浏览器中打开 \`index.html\` 文件
2. 或使用命令行: \`open index.html\` (macOS)

## 注意事项

1. **浏览器要求**: 推荐使用 Chrome 90+ 或 Edge 90+
2. **资源文件**: 首次使用需要上传背景音乐和图片资源
3. **数据存储**: 所有数据保存在浏览器 IndexedDB 中，清除浏览器数据会丢失配置
4. **离线使用**: 构建产物完全离线可用

## 首次使用

1. 双击打开 index.html
2. 进入【全局配置】-【图片管理】上传奖品图片
3. 进入【全局配置】-【音乐管理】上传背景音乐
4. 进入【人员配置】导入或添加参与人员
5. 进入【奖项配置】设置奖项
6. 返回首页开始抽奖

## 故障排除

- 如果页面空白，请检查浏览器控制台错误信息
- 如果样式错乱，请清除浏览器缓存后重试
- 建议使用本地服务器运行以获得最佳体验: \`npx serve .\`

## 技术支持

- GitHub: https://github.com/LOG1997/log-lottery
- Issues: https://github.com/LOG1997/log-lottery/issues
`

fs.writeFileSync('dist-file/使用说明.txt', readme, 'utf-8')

// 5. 验证构建
console.log('\n✅ 构建完成！')
console.log(`\n📂 构建产物位置: ${path.resolve('dist-file')}`)
console.log(`📊 构建产物大小: ${getDirectorySize('dist-file')}`)
console.log('\n💡 提示: 双击 dist-file/index.html 即可在浏览器中打开\n')

function getDirectorySize(dirPath) {
  let size = 0
  const files = fs.readdirSync(dirPath)
  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath)
    } else {
      size += stats.size
    }
  })
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
