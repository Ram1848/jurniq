const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const componentsDir = path.join(srcDir, 'components');

const mappings = {
  'AdminProtectedRoute': 'common',
  'CTASection': 'common',
  'Footer': 'common',
  'HeroSection': 'common',
  'LoadingSkeleton': 'common',
  'ProtectedRoute': 'common',
  'StatsSection': 'common',
  'WhyChooseUs': 'common',
  'AdminSidebar': 'Sidebar',
  'DriverSidebar': 'Sidebar',
  'DashboardNavbar': 'Navbar',
  'BookRide': 'Cards',
  'FeatureCards': 'Cards'
};

// Create dirs
const newDirs = ['common', 'Navbar', 'Sidebar', 'Cards', 'Chat', 'Notifications', 'Map'];
newDirs.forEach(dir => {
  const p = path.join(componentsDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
});

// Move folders
Object.keys(mappings).forEach(comp => {
  const oldPath = path.join(componentsDir, comp);
  const newPath = path.join(componentsDir, mappings[comp], comp);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
});

// Helper to replace imports in a file
const replaceImports = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  Object.keys(mappings).forEach(comp => {
    const oldImport = new RegExp(`components/${comp}`, 'g');
    const newImport = `components/${mappings[comp]}/${comp}`;
    if (content.match(oldImport)) {
      content = content.replace(oldImport, newImport);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

// Traverse src dir recursively
const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      replaceImports(filePath);
    }
  });
};

walkSync(srcDir);

console.log('Frontend component refactoring complete.');
