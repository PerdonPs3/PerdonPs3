const fs = require('node:fs');
const path = require('node:path');

function frameSvg(source, light = false) {
    const root = source.match(/<svg\b([^>]*)>/);
    if (!root) throw new Error('Expected a generated SVG');
    const attr = (name) => root[1].match(new RegExp(`\\b${name}=["']([^"']+)["']`))?.[1];
    const viewBox = attr('viewBox')?.trim().split(/[\s,]+/).map(Number);
    const dimension = (name, index) => {
        const raw = attr(name);
        return raw && /^\d+(?:\.\d+)?(?:px)?$/.test(raw) ? parseFloat(raw) : viewBox?.[index];
    };
    const width = dimension('width', 2);
    const height = dimension('height', 3);
    if (![width, height].every((n) => Number.isFinite(n) && n > 0)) {
        throw new Error('SVG must have valid dimensions');
    }
    const w = width + 64;
    const h = height + 130;
    const colors = light
        ? { bg: '#faf8f3', edge: '#d9cba7', text: '#59451f', muted: '#746b59', line: '#e7dec9' }
        : { bg: '#0c121b', edge: '#4a412d', text: '#e3c077', muted: '#a9adbc', line: '#292d32' };
    // Nest rather than reserialize: preserve snk's paths, styles and timing exactly.
    const attrs = root[1].replace(/\s(?:x|y|width|height)=["'][^"']*["']/g, '');
    const inner = source.slice(root.index).replace(root[0],
        `<svg${attrs} x="32" y="78" width="${width}" height="${height}" aria-hidden="true">`);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="trail-title trail-desc">
<title id="trail-title">Contribution trail · PerdonPs3</title>
<desc id="trail-desc">A golden snake follows real GitHub contributions. Every commit leaves a mark.</desc>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="${colors.bg}" stroke="${colors.edge}"/>
<path d="M32 29h22" stroke="${colors.text}" stroke-width="2"/>
<text x="65" y="33" fill="${colors.text}" font-family="Consolas,monospace" font-size="11" letter-spacing="2">CONTRIBUTION TRAIL</text>
<text x="32" y="57" fill="${colors.muted}" font-family="Segoe UI,Arial,sans-serif" font-size="13">Every commit leaves a mark.</text>
${inner}
<path d="M32 ${h - 38}H${w - 32}" stroke="${colors.line}"/>
<text x="32" y="${h - 17}" fill="${colors.muted}" font-family="Consolas,monospace" font-size="10">PERDONPS3 / BUILDING, ONE COMMIT AT A TIME</text>
</svg>\n`;
}

if (require.main === module) {
    const preview = process.argv.includes('--preview');
    const output = path.join(__dirname, '..', 'assets');
    fs.mkdirSync(output, { recursive: true });
    for (const [name, light] of [['github-snake.svg', false], ['github-snake-light.svg', true]]) {
        const file = path.join(__dirname, '..', 'dist', name);
        let source;
        if (preview) {
            const { execFileSync } = require('node:child_process');
            source = execFileSync('git', ['show', 'origin/snake-animation:github-snake.svg'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
            const palette = light
                ? ['#946A1D', '#EEE9DC', '#E5D7AF', '#C7AA62', '#AE8735', '#805C19']
                : ['#FFE5A5', '#18212D', '#51432A', '#917039', '#C99D4B', '#F4D286'];
            source = source.replace(/--cs:[^;}]+/, `--cs:${palette[0]}`)
                .replace(/--ce:[^;}]+/, `--ce:${palette[1]}`);
            for (let i = 0; i < 5; i++) source = source.replace(new RegExp(`--c${i}:[^;}]+`), `--c${i}:${palette[i + 1]}`);
        } else {
            source = fs.readFileSync(file, 'utf8');
        }
        const framed = frameSvg(source, light);
        if (!preview) fs.writeFileSync(file, framed);
        fs.writeFileSync(path.join(output, name), framed);
    }
}
module.exports = { frameSvg };
