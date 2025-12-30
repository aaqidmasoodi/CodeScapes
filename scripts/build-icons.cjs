const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');
const SOURCE_SVG = path.join(__dirname, '../public/favicon.svg');
const TARGET_PNG = path.join(BUILD_DIR, 'icon.png');

if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1024,
        height: 1024,
        show: false,
        frame: false,
        transparent: true,
        webPreferences: {
            offscreen: true,
        },
    });

    const svgContent = fs.readFileSync(SOURCE_SVG, 'utf8');
    // Enhance SVG for high-res
    // We replace width="32" height="32" with width="1024" height="1024"
    // And ensure viewBox is kept (it is 0 0 32 32)
    const highResSvg = svgContent
        .replace('width="32"', 'width="1024"')
        .replace('height="32"', 'height="1024"');

    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(highResSvg).toString('base64')}`;

    await win.loadURL(svgDataUrl);

    // Slight delay to ensure rendering
    setTimeout(async () => {
        try {
            const image = await win.capturePage();
            const pngBuffer = image.toPNG();
            fs.writeFileSync(TARGET_PNG, pngBuffer);
            console.log(`Generated icon.png at ${TARGET_PNG}`);
            app.quit();
        } catch (err) {
            console.error('Failed to generate icon:', err);
            app.exit(1);
        }
    }, 1000);
});
