/*
 * The "Based in Bangkok" scene (bento canvas, Main.dc.html). Every colour is
 * a token in src/styles/globals.css (--scene-*), and the sky and water stops
 * change with the site theme there, so the art needs no JS and never flashes
 * on hydration. The temple is drawn once and repeated with <use href>.
 * Decorative: the card hides it from assistive tech.
 */

const fill = (token: string) => ({ fill: `var(${token})` });
const stop = (token: string) => ({ stopColor: `var(${token})` });

const STARS = [
  [412, 34, 1.1],
  [468, 70, 0.9],
  [530, 26, 1.3],
  [604, 58, 0.9],
  [668, 22, 1.1],
  [742, 46, 0.8],
  [930, 30, 1.2],
  [980, 76, 0.9],
  [560, 96, 0.8],
  [700, 92, 1],
  [880, 64, 0.8],
  [452, 120, 0.8],
] as const;

const CLOUDS = [
  [470, 70, 150, 26, 0.22],
  [690, 120, 120, 18, 0.16],
  [930, 150, 140, 22, 0.2],
  [560, 190, 180, 20, 0.12],
  [780, 48, 90, 14, 0.14],
] as const;

const SKYLINE = [
  [382, 268, 22, 62],
  [410, 242, 16, 88],
  [430, 282, 26, 48],
  [462, 226, 14, 104],
  [480, 260, 22, 70],
  [508, 274, 30, 56],
  [544, 248, 18, 82],
  [566, 290, 24, 40],
  [596, 266, 16, 64],
] as const;

/** Four smaller temples behind the full-size one: [x, y, scale]. */
const TEMPLES = [
  [435, 231, 0.3],
  [755, 231, 0.3],
  [344, 178.2, 0.46],
  [584, 178.2, 0.46],
] as const;

const LIGHTS = [
  [850, 258, 1.8],
  [836, 244, 1.4],
  [864, 244, 1.4],
  [850, 226, 1.6],
  [850, 176, 1.4],
  [808, 296, 1.4],
  [892, 296, 1.4],
  [850, 312, 1.8],
] as const;

const TREES = [
  [640, 326, 18],
  [664, 320, 22],
  [690, 326, 16],
  [712, 328, 14],
  [746, 330, 12],
  [786, 334, 10],
  [918, 332, 12],
  [944, 328, 16],
  [990, 324, 22],
  [1010, 330, 18],
  [612, 330, 14],
  [590, 332, 12],
] as const;

const PRANG = "M814 270C816 225 823 175 836 128h28c13 47 20 97 22 142z";

export default function BangkokScene() {
  return (
    <svg
      viewBox="0 0 1000 420"
      preserveAspectRatio="xMaxYMax slice"
      className="block size-full"
    >
      <defs>
        <linearGradient id="kjp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop("--scene-sky-1")} />
          <stop offset=".55" style={stop("--scene-sky-2")} />
          <stop offset=".8" style={stop("--scene-sky-3")} />
        </linearGradient>
        <linearGradient id="kjp-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop("--scene-water-1")} />
          <stop offset="1" style={stop("--water2")} />
        </linearGradient>
        <linearGradient id="kjp-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={stop("--scene-gold-1")} />
          <stop offset=".3" style={stop("--scene-gold-2")} />
          <stop offset=".5" style={stop("--scene-gold-3")} />
          <stop offset=".72" style={stop("--scene-gold-2")} />
          <stop offset="1" style={stop("--scene-gold-4")} />
        </linearGradient>
        <pattern
          id="kjp-tiers"
          width="10"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <rect width="10" height="2" style={fill("--scene-tiers")} />
        </pattern>
        <radialGradient id="kjp-halo">
          <stop offset="0" style={stop("--scene-halo")} />
          <stop offset="1" style={stop("--scene-halo-0")} />
        </radialGradient>
        <filter id="kjp-soft" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="kjp-mist" x="-10%" y="-80%" width="120%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <g id="kjp-temple">
          <path d="M760 336h180v-16H760z" style={fill("--scene-base")} />
          <path d="M772 320h156l-10-18H782z" fill="url(#kjp-gold)" />
          <path d="M788 302h124l-10-17H798z" fill="url(#kjp-gold)" />
          <path d="M802 285h96l-8-15h-80z" fill="url(#kjp-gold)" />
          <path
            d="M800 320v-9a6 6 0 0 1 12 0v9zM888 320v-9a6 6 0 0 1 12 0v9zM822 302v-8a5 5 0 0 1 10 0v8zM868 302v-8a5 5 0 0 1 10 0v8zM845 285v-8a5 5 0 0 1 10 0v8z"
            style={fill("--scene-door")}
          />
          <path d={PRANG} fill="url(#kjp-gold)" />
          <path d={PRANG} fill="url(#kjp-tiers)" />
          <rect
            x="823"
            y="196"
            width="54"
            height="6"
            rx="3"
            style={fill("--scene-band")}
          />
          <rect
            x="830"
            y="150"
            width="40"
            height="5"
            rx="2.5"
            style={fill("--scene-band")}
          />
          <path d="M836 128h28l-7-28h-14z" fill="url(#kjp-gold)" />
          <path d="M843 100h14l-6-42h-2z" style={fill("--scene-spire")} />
          <path
            d="M850 58V38M845 50q5-7 10 0M846 44h8"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ stroke: "var(--scene-finial)" }}
          />
          <g style={{ ...fill("--scene-light"), opacity: "var(--glowop)" }}>
            {LIGHTS.map(([cx, cy, r]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        </g>
      </defs>

      <rect width="1000" height="340" fill="url(#kjp-sky)" />
      <g
        className="kj-stars"
        style={{ ...fill("--onphoto"), opacity: "var(--starop)" }}
      >
        {STARS.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g
        className="kj-clouds"
        filter="url(#kjp-soft)"
        style={fill("--onphoto")}
      >
        {CLOUDS.map(([cx, cy, rx, ry, opacity]) => (
          <ellipse
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            opacity={opacity}
          />
        ))}
      </g>
      <ellipse
        cx="850"
        cy="240"
        rx="190"
        ry="200"
        className="kj-halo"
        fill="url(#kjp-halo)"
        style={{ opacity: "var(--glowop)" }}
      />
      <g filter="url(#kjp-mist)" style={fill("--scene-mist")}>
        {SKYLINE.map(([x, y, width, height]) => (
          <rect key={x} x={x} y={y} width={width} height={height} />
        ))}
      </g>
      {TEMPLES.map(([x, y, scale]) => (
        <use
          key={`${x}-${y}`}
          href="#kjp-temple"
          transform={`translate(${x} ${y}) scale(${scale})`}
        />
      ))}
      <use href="#kjp-temple" />
      <g style={fill("--scene-tree")}>
        {TREES.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <path d="M540 346h460v-10H540z" style={fill("--scene-bank")} />
      <rect y="344" width="1000" height="76" fill="url(#kjp-water)" />
      <g filter="url(#kjp-mist)" style={{ opacity: "var(--glowop)" }}>
        <ellipse
          cx="850"
          cy="370"
          rx="46"
          ry="26"
          style={fill("--scene-reflect")}
        />
        <ellipse
          cx="735"
          cy="364"
          rx="18"
          ry="14"
          style={fill("--scene-reflect-2")}
        />
        <ellipse
          cx="975"
          cy="364"
          rx="18"
          ry="14"
          style={fill("--scene-reflect-2")}
        />
      </g>
      <path
        className="kj-shimmer"
        d="M560 362h120M720 372h90M880 380h100M600 394h140M800 404h120"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        style={{ stroke: "var(--scene-shimmer)" }}
      />
      <g className="kj-boat">
        <path d="M782 366h120l-10 9h-104z" style={fill("--scene-hull")} />
        <path d="M790 366h104v-3H790z" style={fill("--scene-trim")} />
        <path
          d="M812 363v-9h44v9"
          fill="none"
          strokeWidth="2"
          style={{ stroke: "var(--scene-cabin)" }}
        />
      </g>
    </svg>
  );
}
