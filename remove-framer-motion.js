#!/usr/bin/env node

console.log('🧹 Removing Framer Motion from all files...\n');

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove framer-motion imports
    const importRegex = /import\s+.*from\s+['"]framer-motion['"];?\s*\n?/g;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, '');
      modified = true;
      console.log(`✅ Removed framer-motion import from: ${filePath}`);
    }

    // Remove motion. components and replace with div
    const motionDivRegex = /<motion\.div[^>]*>/g;
    if (motionDivRegex.test(content)) {
      content = content.replace(motionDivRegex, '<div>');
      modified = true;
      console.log(`✅ Replaced motion.div with div in: ${filePath}`);
    }

    // Remove closing motion.div tags
    const motionDivCloseRegex = /<\/motion\.div>/g;
    if (motionDivCloseRegex.test(content)) {
      content = content.replace(motionDivCloseRegex, '</div>');
      modified = true;
    }

    // Remove motion.p components and replace with p
    const motionPRegex = /<motion\.p[^>]*>/g;
    if (motionPRegex.test(content)) {
      content = content.replace(motionPRegex, '<p>');
      modified = true;
      console.log(`✅ Replaced motion.p with p in: ${filePath}`);
    }

    // Remove closing motion.p tags
    const motionPCloseRegex = /<\/motion\.p>/g;
    if (motionPCloseRegex.test(content)) {
      content = content.replace(motionPCloseRegex, '</p>');
      modified = true;
    }

    // Remove AnimatePresence components
    const animatePresenceRegex = /<AnimatePresence[^>]*>/g;
    if (animatePresenceRegex.test(content)) {
      content = content.replace(animatePresenceRegex, '<>');
      modified = true;
      console.log(`✅ Replaced AnimatePresence with Fragment in: ${filePath}`);
    }

    // Remove closing AnimatePresence tags
    const animatePresenceCloseRegex = /<\/AnimatePresence>/g;
    if (animatePresenceCloseRegex.test(content)) {
      content = content.replace(animatePresenceCloseRegex, '</>');
      modified = true;
    }

    // Remove motion props (initial, animate, exit, transition, etc.)
    const motionPropsRegex = /\s+(initial|animate|exit|transition|whileHover|whileTap|variants|custom|onAnimationComplete|onAnimationStart|layoutId|layout|drag|dragConstraints|dragElastic|dragMomentum|dragTransition|whileDrag|onDrag|onDragStart|onDragEnd|onDirectionLock|onViewportEnter|onViewportLeave|viewport|style|transformTemplate)=\{[^}]*\}/g;
    if (motionPropsRegex.test(content)) {
      content = content.replace(motionPropsRegex, '');
      modified = true;
      console.log(`✅ Removed motion props from: ${filePath}`);
    }

    // Remove motion props with string values
    const motionPropsStringRegex = /\s+(initial|animate|exit|transition|whileHover|whileTap|variants|custom|onAnimationComplete|onAnimationStart|layoutId|layout|drag|dragConstraints|dragElastic|dragMomentum|dragTransition|whileDrag|onDrag|onDragStart|onDragEnd|onDirectionLock|onViewportEnter|onViewportLeave|viewport|style|transformTemplate)="[^"]*"/g;
    if (motionPropsStringRegex.test(content)) {
      content = content.replace(motionPropsStringRegex, '');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`💾 Saved changes to: ${filePath}`);
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalModified = 0;

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git directories
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
        totalModified += processDirectory(fullPath);
      }
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
      if (processFile(fullPath)) {
        totalModified++;
      }
    }
  }

  return totalModified;
}

// Start processing from src directory
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  const modifiedCount = processDirectory(srcPath);
  console.log(`\n🎉 Completed! Modified ${modifiedCount} files.`);
  console.log('✨ All Framer Motion animations have been removed.');
  console.log('🚀 Your website should now load faster without animation overhead.');
} else {
  console.error('❌ src directory not found');
}