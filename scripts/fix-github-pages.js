#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

console.log('🔧 Preparing GitHub Pages deployment...');

// Fix manifest.json for GitHub Pages base path
if (basePath) {
  const manifestPath = path.join(process.cwd(), 'out', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update scope and start_url for GitHub Pages
    manifest.scope = basePath;
    manifest.start_url = basePath;
    
    // Update icon paths - only add basePath if it's not already there
    manifest.icons = manifest.icons.map(icon => ({
      ...icon,
      src: icon.src.startsWith(basePath) ? icon.src : `${basePath}${icon.src}`
    }));
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Fixed manifest.json for GitHub Pages');
  }
}

// Add .nojekyll file to prevent Jekyll processing
const nojekyllPath = path.join(process.cwd(), 'out', '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('✅ Added .nojekyll file');

// For GitHub Pages, we also need to handle 404 routing for SPA
// Copy index.html to 404.html for client-side routing
const indexPath = path.join(process.cwd(), 'out', 'index.html');
const notFoundPath = path.join(process.cwd(), 'out', '404.html');
if (fs.existsSync(indexPath) && !fs.existsSync(notFoundPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✅ Created 404.html for SPA routing');
}

console.log('🚀 GitHub Pages build preparation complete!');