import Phaser from 'phaser';

type Ctx = CanvasRenderingContext2D;
function texture(scene: Phaser.Scene, key: string, w: number, h: number, paint: (c: Ctx) => void) {
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h);
  if (!t) throw new Error(`Cannot create ${key}`);
  paint(t.context);
  t.refresh();
}
function shape(c: Ctx, points: number[][], fill: string) {
  c.fillStyle = fill;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
}
function rand(seed: number) {
  let a = seed;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

export function createArt(scene: Phaser.Scene) {
  texture(scene, 'sky', 1280, 720, (c) => {
    const gradient = c.createLinearGradient(0, 0, 0, 720);
    gradient.addColorStop(0, '#233d42');
    gradient.addColorStop(0.38, '#a48c70');
    gradient.addColorStop(0.62, '#e4b078');
    gradient.addColorStop(1, '#304a45');
    c.fillStyle = gradient;
    c.fillRect(0, 0, 1280, 720);
    const glow = c.createRadialGradient(875, 320, 5, 875, 320, 300);
    glow.addColorStop(0, '#f6d4a17a');
    glow.addColorStop(1, '#e3af7500');
    c.fillStyle = glow;
    c.fillRect(0, 0, 1280, 650);
    c.fillStyle = '#eed0a6';
    c.beginPath();
    c.arc(875, 321, 49, 0, Math.PI * 2);
    c.fill();
    const r = rand(54);
    for (let i = 0; i < 50; i++) {
      c.fillStyle = `rgba(33,59,60,${r() * 0.045})`;
      c.beginPath();
      c.ellipse(r() * 1280, r() * 310, 80 + r() * 200, 3 + r() * 14, 0, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 7000; i++) {
      c.fillStyle = `rgba(245,220,170,${r() * 0.035})`;
      c.fillRect(r() * 1280, r() * 720, 1, 1);
    }
  });
  texture(scene, 'island', 1800, 360, (c) => {
    shape(
      c,
      [
        [0, 340],
        [0, 252],
        [100, 228],
        [185, 231],
        [280, 178],
        [380, 190],
        [470, 150],
        [510, 155],
        [600, 218],
        [700, 237],
        [850, 285],
        [1020, 250],
        [1090, 220],
        [1150, 236],
        [1210, 198],
        [1300, 248],
        [1410, 225],
        [1550, 290],
        [1650, 280],
        [1800, 310],
        [1800, 360],
      ],
      '#405950',
    );
    shape(
      c,
      [
        [0, 360],
        [0, 313],
        [100, 292],
        [230, 316],
        [360, 279],
        [470, 286],
        [550, 317],
        [720, 307],
        [880, 333],
        [990, 297],
        [1100, 315],
        [1210, 302],
        [1430, 330],
        [1610, 317],
        [1800, 342],
        [1800, 360],
      ],
      '#334c46',
    );
  });
  texture(scene, 'water', 1600, 270, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 270);
    g.addColorStop(0, '#658078');
    g.addColorStop(0.3, '#486862');
    g.addColorStop(1, '#1d3939');
    c.fillStyle = g;
    c.fillRect(0, 0, 1600, 270);
    const r = rand(90);
    for (let i = 0; i < 400; i++) {
      let y = r() * 270;
      c.strokeStyle = i % 4 === 0 ? '#d2b58255' : '#9fb2a123';
      c.lineWidth = r() * 2 + 1;
      c.beginPath();
      const x = r() * 1600;
      c.moveTo(x, y);
      c.lineTo(x + 10 + r() * 110, y);
      c.stroke();
    }
  });
  texture(scene, 'house', 510, 350, (c) => {
    // Open stilts, woven walls, pitched attap roof and projecting verandah.
    for (const x of [100, 260, 410]) {
      c.fillStyle = '#202b29';
      c.fillRect(x, 222, 12, 118);
      c.fillStyle = '#6b6650';
      c.fillRect(x, 222, 3, 111);
    }
    shape(
      c,
      [
        [78, 143],
        [267, 83],
        [440, 153],
        [437, 265],
        [78, 256],
      ],
      '#695c43',
    );
    shape(
      c,
      [
        [267, 83],
        [440, 153],
        [437, 265],
        [267, 230],
      ],
      '#424537',
    );
    const r = rand(4);
    for (let x = 84; x < 268; x += 13) {
      c.strokeStyle = x % 2 ? '#8c7957' : '#4c4a38';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x, 143 - (x - 78) * 0.31);
      c.lineTo(x, 254 - (x - 78) * 0.14);
      c.stroke();
    }
    for (let y = 153; y < 250; y += 12) {
      c.strokeStyle = '#b29a6426';
      c.beginPath();
      c.moveTo(79, y);
      c.lineTo(265, y - 15);
      c.stroke();
    }
    shape(
      c,
      [
        [36, 151],
        [258, 30],
        [484, 148],
        [457, 167],
        [260, 90],
        [74, 169],
      ],
      '#26362f',
    );
    shape(
      c,
      [
        [36, 151],
        [258, 30],
        [269, 91],
        [74, 169],
      ],
      '#53604a',
    );
    for (let i = 0; i < 90; i++) {
      const x = 48 + i * 2.4;
      const y = 147 - (x - 48) * 0.5;
      c.strokeStyle = `rgba(185,161,101,${0.1 + r() * 0.17})`;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 12, y + 39);
      c.stroke();
    }
    c.strokeStyle = '#b1a071';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(34, 151);
    c.lineTo(258, 28);
    c.lineTo(484, 148);
    c.stroke();
    shape(
      c,
      [
        [120, 165],
        [162, 155],
        [162, 208],
        [120, 214],
      ],
      '#142c2b',
    );
    shape(
      c,
      [
        [127, 167],
        [157, 160],
        [157, 200],
        [127, 205],
      ],
      '#bd9652',
    );
    c.fillStyle = '#172a27';
    c.fillRect(140, 164, 4, 43);
    shape(
      c,
      [
        [201, 160],
        [242, 149],
        [242, 239],
        [201, 245],
      ],
      '#172c29',
    );
    shape(
      c,
      [
        [313, 165],
        [357, 183],
        [357, 218],
        [313, 204],
      ],
      '#152d2d',
    );
    shape(
      c,
      [
        [63, 253],
        [272, 227],
        [457, 266],
        [253, 293],
      ],
      '#685f46',
    );
    c.strokeStyle = '#b19b68';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(65, 252);
    c.lineTo(273, 227);
    c.lineTo(455, 265);
    c.stroke();
    for (let i = 0; i < 4; i++) {
      shape(
        c,
        [
          [190 - i * 12, 286 + i * 12],
          [247 + i * 3, 279 + i * 12],
          [253 + i * 3, 288 + i * 12],
          [186 - i * 12, 296 + i * 12],
        ],
        '#706246',
      );
    }
    c.fillStyle = '#263932';
    for (let x = 79; x < 191; x += 23) c.fillRect(x, 230, 4, 30);
    c.fillRect(75, 229, 120, 4);
  });
  texture(scene, 'palm', 300, 490, (c) => {
    shape(
      c,
      [
        [135, 488],
        [151, 488],
        [163, 364],
        [163, 265],
        [149, 163],
        [136, 102],
        [128, 104],
        [143, 237],
        [147, 354],
      ],
      '#273b32',
    );
    c.strokeStyle = '#87907166';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(138, 480);
    c.quadraticCurveTo(161, 280, 131, 112);
    c.stroke();
    for (let y = 174; y < 460; y += 19) {
      c.strokeStyle = '#b2a16a35';
      c.beginPath();
      c.moveTo(145, y);
      c.lineTo(159, y + 4);
      c.stroke();
    }
    const fronds = [
      [-127, -46],
      [-125, 30],
      [-102, 95],
      [-57, -100],
      [30, -93],
      [122, -64],
      [141, 8],
      [117, 92],
      [61, 112],
    ];
    fronds.forEach(([dx, dy]) => {
      c.strokeStyle = '#243d31';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(131, 105);
      c.quadraticCurveTo(131 + dx * 0.55, 70 + dy * 0.4, 131 + dx, 105 + dy);
      c.stroke();
      for (let i = 1; i < 17; i++) {
        const t = i / 17,
          x = 131 + dx * t,
          y = 105 + dy * t - 30 * Math.sin(t * Math.PI),
          spread = 24 * Math.sin(t * Math.PI);
        shape(
          c,
          [
            [x, y],
            [x - dy * 0.12 - spread, y + dx * 0.12 + spread],
            [x + dx * 0.065, y + dy * 0.065],
          ],
          '#294634',
        );
        shape(
          c,
          [
            [x, y],
            [x + dy * 0.1 + spread * 0.5, y - dx * 0.1 + spread],
            [x + dx * 0.07, y + dy * 0.07],
          ],
          '#334e38',
        );
      }
    });
    c.fillStyle = '#323d29';
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(125 + i * 9, 113 + (i % 2) * 7, 6, 9, 0.3, 0, Math.PI * 2);
      c.fill();
    }
  });
  texture(scene, 'boat', 290, 110, (c) => {
    shape(
      c,
      [
        [5, 41],
        [59, 65],
        [226, 65],
        [284, 23],
        [258, 81],
        [192, 100],
        [63, 92],
        [28, 74],
      ],
      '#273d36',
    );
    shape(
      c,
      [
        [5, 41],
        [59, 65],
        [226, 65],
        [284, 23],
        [263, 48],
        [224, 73],
        [64, 73],
      ],
      '#b18d56',
    );
    c.strokeStyle = '#987a4a';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(38, 78);
    c.quadraticCurveTo(152, 103, 254, 72);
    c.stroke();
    c.strokeStyle = '#9c8c65';
    c.beginPath();
    c.moveTo(172, 68);
    c.lineTo(102, 0);
    c.stroke();
  });
  texture(scene, 'foliage', 480, 200, (c) => {
    const r = rand(11);
    for (let i = 0; i < 80; i++) {
      const x = r() * 480,
        y = 150 + r() * 50,
        dx = (r() - 0.5) * 90,
        dy = -25 - r() * 130;
      c.fillStyle = i % 3 === 0 ? '#142c26' : '#0d2320';
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + dx * 0.2, y + dy, x + dx, y + dy);
      c.quadraticCurveTo(x + dx * 0.8, y + dy * 0.25, x, y);
      c.fill();
    }
  });
  texture(scene, 'ground', 1280, 170, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 170);
    g.addColorStop(0, '#776b4d');
    g.addColorStop(0.13, '#414837');
    g.addColorStop(1, '#102522');
    c.fillStyle = g;
    c.fillRect(0, 0, 1280, 170);
    const r = rand(25);
    for (let i = 0; i < 1800; i++) {
      c.fillStyle = i % 3 === 0 ? '#b8a57825' : '#182d2866';
      c.fillRect(r() * 1280, r() * 160, 2 + r() * 7, 1 + r() * 2);
    }
    for (let i = 0; i < 120; i++) {
      let x = r() * 1280;
      c.strokeStyle = '#9b976653';
      c.beginPath();
      c.moveTo(x, 5);
      c.lineTo(x - 4, -r() * 13);
      c.stroke();
    }
  });
  texture(scene, 'vignette', 1280, 720, (c) => {
    const g = c.createRadialGradient(640, 340, 170, 640, 360, 760);
    g.addColorStop(0, '#07191400');
    g.addColorStop(0.55, '#07191405');
    g.addColorStop(1, '#071914b0');
    c.fillStyle = g;
    c.fillRect(0, 0, 1280, 720);
  });
}
