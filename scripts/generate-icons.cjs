const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const assets = path.join(__dirname, '..', 'assets');
  const logo = await fs.readFile(path.join(assets, 'logo.svg'), 'utf8');
  const definitions = logo.match(/<defs>[\s\S]*?<\/defs>/)?.[0];
  const bookStart = logo.indexOf('<g filter="url(#soft-shadow)">');
  if (!definitions || bookStart === -1) throw new Error('Estrutura do logo.svg não reconhecida.');
  const book = logo.slice(bookStart, logo.lastIndexOf('</svg>'));
  const foreground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 512 512">${definitions}<g transform="translate(256 256) scale(0.72) translate(-256 -256)">${book}</g></svg>`;
  const fullLogo = logo.replace('width="100%" height="100%"', 'width="1024" height="1024"');
  await sharp(Buffer.from(fullLogo)).resize(1024, 1024).flatten({ background: '#403243' }).png().toFile(path.join(assets, 'icon.png'));
  await sharp(Buffer.from(foreground)).png().toFile(path.join(assets, 'android-icon-foreground.png'));
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#403243' } }).png().toFile(path.join(assets, 'android-icon-background.png'));
  const alpha = await sharp(Buffer.from(foreground)).ensureAlpha().extractChannel('alpha').toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#ffffff' } }).joinChannel(alpha).png().toFile(path.join(assets, 'android-icon-monochrome.png'));
  await sharp(Buffer.from(fullLogo)).resize(64, 64).png().toFile(path.join(assets, 'favicon.png'));
  console.log('Ícones gerados a partir de assets/logo.svg.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
