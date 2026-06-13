"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * WebGL "systems field" behind the hero — a slow constellation of wireframe
 * polyhedra (building blocks / nodes, honest to a builder rather than crypto
 * coins) that parallaxes to the cursor and drifts/fades on scroll.
 *
 * Loaded only via `HeroBackdrop` (dynamic, ssr:false) and only when the user
 * allows motion, so `three` never ships on the first paint and never animates
 * for reduced-motion users. The component owns full GPU cleanup on unmount.
 */

interface Block {
  mesh: THREE.LineSegments;
  spin: THREE.Vector3;
  bobPhase: number;
  bobAmp: number;
  baseY: number;
}

function readTheme(): { fg: THREE.Color; accent: THREE.Color; isLight: boolean } {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const fg = styles.getPropertyValue("--fg").trim() || "#ededed";
  const accent = styles.getPropertyValue("--accent").trim() || "#34d399";
  return {
    fg: new THREE.Color(fg),
    accent: new THREE.Color(accent),
    isLight: root.classList.contains("light"),
  };
}

// Wireframes need more presence on paper than on black: dark `--fg` lines at
// 0.22 read as faint clutter on the light theme, so lift their opacity there.
function lineOpacity(isAccent: boolean, isLight: boolean): number {
  if (isAccent) return isLight ? 0.6 : 0.5;
  return isLight ? 0.34 : 0.22;
}

const GEOMETRIES = [
  () => new THREE.IcosahedronGeometry(1, 0),
  () => new THREE.OctahedronGeometry(1, 0),
  () => new THREE.TetrahedronGeometry(1, 0),
  () => new THREE.TorusGeometry(0.8, 0.28, 8, 16),
  () => new THREE.DodecahedronGeometry(1, 0),
];

export function HeroField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 14;

    // WebGLRenderer throws when no GL context is available (WebGL disabled,
    // blocklisted GPU, headless without SwiftShader). Degrade to no field — the
    // hero content (the static SSR headline/LCP) is unaffected — instead of
    // throwing an uncaught error out of the effect. Nothing GPU-backed has been
    // allocated yet, so returning here leaks nothing.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const theme0 = readTheme();
    let fg = theme0.fg;
    let accent = theme0.accent;
    const isLight = theme0.isLight;

    const group = new THREE.Group();
    scene.add(group);

    const COUNT = 15;
    const blocks: Block[] = [];
    const sharedMaterials: THREE.LineBasicMaterial[] = [];

    for (let i = 0; i < COUNT; i++) {
      const geo = GEOMETRIES[i % GEOMETRIES.length]();
      const edges = new THREE.EdgesGeometry(geo);
      geo.dispose();
      const isAccent = i % 7 === 3; // a couple of earned-accent nodes
      const material = new THREE.LineBasicMaterial({
        color: isAccent ? accent : fg,
        transparent: true,
        opacity: lineOpacity(isAccent, isLight),
      });
      sharedMaterials.push(material);
      const mesh = new THREE.LineSegments(edges, material);

      // Scatter across a wide, deep volume; smaller/fainter further back.
      const depth = -8 - Math.random() * 14;
      const spread = 9 + Math.abs(depth) * 0.6;
      const scale = 0.5 + Math.random() * 1.6;
      mesh.scale.setScalar(scale);
      const y = (Math.random() - 0.5) * spread;
      let x = (Math.random() - 0.5) * spread * 2;
      // Keep the field out of the centred content column so shapes never drift
      // onto the headline / CTAs. The keep-out includes the shape's own radius
      // (`+ scale`) so large shapes don't reach in edge-first; shapes well above
      // or below the content band may still cross the centre — they read as
      // behind the text, not over it.
      const corridorHalf = spread * 0.42 + scale;
      if (Math.abs(y) < spread * 0.62 && Math.abs(x) < corridorHalf) {
        const side = x < 0 ? -1 : 1;
        x = side * (corridorHalf + Math.random() * spread * 0.6);
      }
      mesh.position.set(x, y, depth);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      group.add(mesh);

      blocks.push({
        mesh,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.1,
        ),
        bobPhase: Math.random() * Math.PI * 2,
        bobAmp: 0.2 + Math.random() * 0.5,
        baseY: mesh.position.y,
      });
    }

    // Cursor parallax target (normalized -1..1), eased toward each frame.
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Re-tint on theme toggle (next-themes flips the html class).
    const themeObserver = new MutationObserver(() => {
      const next = readTheme();
      fg = next.fg;
      accent = next.accent;
      sharedMaterials.forEach((m, i) => {
        const accented = i % 7 === 3;
        m.color.copy(accented ? accent : fg);
        m.opacity = lineOpacity(accented, next.isLight);
      });
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const clock = new THREE.Clock();
    let frame = 0;

    const renderFrame = () => {
      frame = requestAnimationFrame(renderFrame);
      if (document.hidden) return;

      const t = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.05);

      eased.x += (pointer.x - eased.x) * 0.04;
      eased.y += (pointer.y - eased.y) * 0.04;
      group.rotation.y = eased.x * 0.35;
      group.rotation.x = eased.y * 0.2;

      // Scroll drift + fade: the field sinks and dims as the hero scrolls away.
      const progress = Math.min(
        1,
        window.scrollY / Math.max(1, window.innerHeight),
      );
      group.position.y = progress * 6;
      const fieldOpacity = 1 - progress;
      renderer.domElement.style.opacity = fieldOpacity.toFixed(3);

      for (const block of blocks) {
        block.mesh.rotation.x += block.spin.x * delta;
        block.mesh.rotation.y += block.spin.y * delta;
        block.mesh.rotation.z += block.spin.z * delta;
        block.mesh.position.y =
          block.baseY + Math.sin(t * 0.5 + block.bobPhase) * block.bobAmp;
      }

      // Skip rendering entirely once the hero is fully scrolled past.
      if (fieldOpacity > 0.01) renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(renderFrame);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
      blocks.forEach((b) => {
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      // Explicitly drop the GL context so React StrictMode's mount→unmount→mount
      // in dev (and any remount) never accumulates "too many WebGL contexts".
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="absolute inset-0 h-full w-full [&>canvas]:transition-opacity [&>canvas]:duration-300"
    />
  );
}
