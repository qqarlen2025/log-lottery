#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

console.log('🔍 验证 File 模式构建产物...\n')

const issues = []
const warnings = []

// 1. 检查必要文件
console.log('1️⃣ 检查必要文件...')
const requiredFiles = [
  'index.html',
  'assets',
  'js',
]

requiredFiles.forEach((file) => {
  const filePath = path.join('dist-file', file)
  if (!fs.existsSync(filePath)) {
    issues.push(`❌ 缺少必要文件/目录: ${file}`)
  } else {
    console.log(`  ✓ 找到: ${file}`)
  }
})

// 2. 检查 HTML 中的资源路径
console.log('\n2️⃣ 检查 HTML 资源路径...')
const htmlPath = path.join('dist-file', 'index.html')
if (fs.existsSync(htmlPath)) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8')

  // 检查绝对路径（除 src="..." 外的绝对路径）
  const absolutePaths = htmlContent.match(/href="\/[^"]+"/g) || []
  absolutePaths.forEach(p => {
    if (!p.includes('/src/')) {
      warnings.push(`⚠️  HTML 中发现可能的绝对路径: ${p}`)
    }
  })

  // 检查是否有相对 base 路径
  const hasRelativeBase = htmlContent.includes('<base href="./"') ||
                          htmlContent.includes('base="./"')
  if (hasRelativeBase) {
    console.log('  ✓ 检测到相对 base 路径')
  } else {
    console.log('  ℹ️  未检测到显式 base 路径（使用默认相对路径）')
  }
} else {
  issues.push('❌ 找不到 index.html 文件')
}

// 3. 检查 JS 文件中的资源引用
console.log('\n3️⃣ 检查 JS 文件资源引用...')
const jsDir = path.join('dist-file', 'js')
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'))
  let hasHashRouter = false
  jsFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf-8')
    if (content.includes('createWebHashHistory')) {
      hasHashRouter = true
    }
    if (content.includes('https://to2026.xyz')) {
      warnings.push(`⚠️  ${file} 包含外部 URL，离线时可能无法加载`)
    }
  })

  if (hasHashRouter) {
    console.log('  ✓ 检测到 hash 路由模式')
  } else {
    issues.push('❌ 未检测到 hash 路由模式，file:// 协议下可能无法导航')
  }
} else {
  issues.push('❌ 找不到 js 目录')
}

// 4. 检查 dog.svg
console.log('\n4️⃣ 检查图标文件...')
const dogSvgPath = path.join('dist-file', 'dog.svg')
if (fs.existsSync(dogSvgPath)) {
  console.log('  ✓ dog.svg 已复制到构建目录')
} else {
  warnings.push('⚠️  dog.svg 未复制到构建目录（favicon 可能无法显示）')
}

// 5. 检查使用说明
console.log('\n5️⃣ 检查使用说明...')
const readmePath = path.join('dist-file', '使用说明.txt')
if (fs.existsSync(readmePath)) {
  console.log('  ✓ 使用说明已生成')
} else {
  warnings.push('⚠️  使用说明未生成')
}

// 6. 输出结果
console.log('\n' + '='.repeat(50))
if (issues.length === 0) {
  console.log('✅ 验证通过！构建产物符合 file 模式要求')
  if (warnings.length > 0) {
    console.log('\n⚠️  以下警告可忽略:')
    warnings.forEach(w => console.log(w))
  }
  console.log('\n🎉 构建产物已就绪，可以分发给用户！')
} else {
  console.log('❌ 发现以下问题:')
  issues.forEach(issue => console.log(issue))
  if (warnings.length > 0) {
    console.log('\n⚠️  警告:')
    warnings.forEach(w => console.log(w))
  }
  console.log('\n建议修复后再发布')
  process.exit(1)
}
