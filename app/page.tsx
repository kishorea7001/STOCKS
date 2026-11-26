'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import rawDots from '@/data/landdots.json';
import { Mic, ArrowUpRight, LayoutDashboard, Volume2 } from 'lucide-react';

export default function KvFreightLandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const hwrapRef = useRef<HTMLDivElement | null>(null);
  const hzRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const vnavRef = useRef<HTMLUListElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  const trackRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const giantLettersRef = useRef<HTMLDivElement | null>(null);
  const speedRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    // Add js-anim class to html
    const root = document.documentElement;
    root.classList.add('js-anim');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isRecorder = location.search.includes('rec=1');

    // Register --hl custom property if supported
    if (window.CSS && CSS.registerProperty) {
      try {
        CSS.registerProperty({
          name: '--hl',
          syntax: '<number>',
          inherits: false,
          initialValue: '1',
        });
      } catch {
        // ignore
      }
    }

    // 4s Failsafe
    const timer = setTimeout(() => {
      root.classList.add('anim-done');
      document.querySelectorAll('.ent').forEach((el) => el.classList.remove('ent'));
    }, 4000);

    // Dynamic viewport units and layout modes
    let vw = root.clientWidth;
    let vh = root.clientHeight;
    let isPort = false;
    let isLand = false;
    let isHp = false;
    let isSticky = false;
    let uc = 1, uv = 1, us = 1, u = 1;

    let entranceFinished = false;
    const A = 2.4;
    let B = 2.0;

    function updateTrackHeight() {
      const stripWidth = stripRef.current ? stripRef.current.scrollWidth : 2000;
      B = ((stripWidth + 0.45 * vw) / vw) * 1.1;
      const totalScreens = 1 + A + B;
      if (trackRef.current) {
        trackRef.current.style.height = `${totalScreens * vh}px`;
      }
    }

    function updateVideoLayout() {
      if (!videoRef.current || !sceneRef.current) return;
      let vidW: number, vidH: number, vidL: number, vidT: number;
      if (isHp) {
        vidW = 1.55 * vw;
        vidH = vidW * (1080 / 1920);
        vidL = 0.5 * vw - 0.40 * vidW;
        vidT = 0.36 * vh - 0.448 * vidH;
      } else {
        const s = Math.max(vw / 1920, vh / 1080);
        vidW = 1920 * s;
        vidH = 1080 * s;
        vidL = (vw - vidW) / 2;
        vidT = (vh - vidH) / 2;
      }
      videoRef.current.style.width = `${vidW}px`;
      videoRef.current.style.height = `${vidH}px`;
      videoRef.current.style.left = `${vidL}px`;
      videoRef.current.style.top = `${vidT}px`;

      const edgePx = vidT + 0.448 * vidH;
      root.style.setProperty('--edge-px', `${edgePx}px`);

      const cutLine = vidT + 0.90 * vidH;
      sceneRef.current.style.background = `linear-gradient(to bottom, #ffffff ${cutLine}px, #111111 ${cutLine}px)`;
    }

    function updateUnits() {
      vw = root.clientWidth;
      vh = root.clientHeight;
      isPort = vw <= vh;
      isLand = !isPort && vh < 500;
      isHp = isPort || isLand || vw < 768;
      isSticky = !isPort && !isLand && vh >= 500;

      root.classList.toggle('m-port', isPort);
      root.classList.toggle('m-land', isLand);
      root.classList.toggle('m-hp', isHp);
      root.classList.toggle('sticky', isSticky);

      // --uc
      if (!isPort && vh < 520) {
        uc = Math.min(vw / 1440, Math.max(vh / 900, 0.6));
      } else {
        uc = Math.min(vw / 1440, vh / 900);
      }

      // --uv
      const heroHeight = isPort ? (heroRef.current ? heroRef.current.clientHeight : vh) : vh;
      uv = Math.max(vw / 1440, heroHeight / 900);

      // --us
      us = vw / 1440;

      // --u
      if (isLand) {
        u = vh / 430;
      } else if (isHp) {
        u = Math.min(vw / 430, 1.4);
      } else {
        u = Math.min(vw / 1440, vh / 960);
      }

      root.style.setProperty('--uc', `${uc}px`);
      root.style.setProperty('--uv', `${uv}px`);
      root.style.setProperty('--us', `${us}px`);
      root.style.setProperty('--u', `${u}px`);

      updateVideoLayout();
      updateTrackHeight();
    }

    // GLOBE INITIALIZATION & RENDERING
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert dots to unit vectors
    const dots: { x: number; y: number; z: number; lat: number; lon: number }[] = [];
    for (let i = 0; i < rawDots.length; i += 2) {
      const lonDeg = rawDots[i] / 10;
      const latDeg = rawDots[i + 1] / 10;
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180;
      dots.push({
        x: Math.cos(lat) * Math.sin(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.cos(lon),
        lat,
        lon,
      });
    }

    // 3 Cities
    const cities = [
      { name: 'ROTTERDAM', lat: 51.92, lon: 4.48, vec: { x: 0, y: 0, z: 0 } },
      { name: 'LAGOS', lat: 6.45, lon: 3.39, vec: { x: 0, y: 0, z: 0 } },
      { name: 'SANTOS', lat: -23.96, lon: -46.33, vec: { x: 0, y: 0, z: 0 } },
    ];

    cities.forEach((c) => {
      const rLat = (c.lat * Math.PI) / 180;
      const rLon = (c.lon * Math.PI) / 180;
      c.vec = {
        x: Math.cos(rLat) * Math.sin(rLon),
        y: Math.sin(rLat),
        z: Math.cos(rLat) * Math.cos(rLon),
      };
    });

    // 3 Great-circle arcs
    const arcPairs = [
      [cities[0], cities[2]], // Rotterdam -> Santos
      [cities[0], cities[1]], // Rotterdam -> Lagos
      [cities[1], cities[2]], // Lagos -> Santos
    ];

    function computeSlerpArc(v1: { x: number; y: number; z: number }, v2: { x: number; y: number; z: number }) {
      const dot = Math.max(-1, Math.min(1, v1.x * v2.x + v1.y * v2.y + v1.z * v2.z));
      const omega = Math.acos(dot);
      const pts = [];
      const count = 57;
      const sinOmega = Math.sin(omega);

      for (let i = 0; i < count; i++) {
        const f = i / (count - 1);
        let vx, vy, vz;
        if (sinOmega > 1e-5) {
          const a = Math.sin((1 - f) * omega) / sinOmega;
          const b = Math.sin(f * omega) / sinOmega;
          vx = a * v1.x + b * v2.x;
          vy = a * v1.y + b * v2.y;
          vz = a * v1.z + b * v2.z;
        } else {
          vx = v1.x;
          vy = v1.y;
          vz = v1.z;
        }
        const lift = 1 + (0.07 + (0.42 * omega) / Math.PI) * Math.sin(Math.PI * f);
        pts.push({ x: vx * lift, y: vy * lift, z: vz * lift });
      }
      return { pts, omega };
    }

    const arcsData = arcPairs.map((p) => computeSlerpArc(p[0].vec, p[1].vec));

    let dpr = 1;
    function resizeGlobe() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    updateUnits();
    resizeGlobe();

    const onResize = () => {
      updateUnits();
      resizeGlobe();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    const startTime = performance.now();
    const tiltRad = (9 * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);
    let currentGlowE = 1.18;

    function drawGlobe(nowTime: number) {
      if (!ctx || !canvas) return;
      const tSec = (nowTime - startTime) / 1000;
      if (currentGlowE < -0.1) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const introAlpha = prefersReducedMotion
        ? 1
        : Math.max(0, Math.min(1, 1 - Math.pow(1 - Math.min(tSec / 1.1, 1), 3)));
      const scrollDim = Math.max(0, Math.min(1, 0.45 + 0.55 * Math.max(0, Math.min(1, currentGlowE / 0.7))));
      ctx.globalAlpha = introAlpha * scrollDim;

      let cx: number, cy: number, R: number, scale: number;
      if (isPort) {
        const up = (1.25 * vw) / 800;
        scale = up;
        const originX = vw - 1440 * up;
        const originY = 16 - 130 * up;
        cx = originX + 1166 * up;
        cy = originY + 530 * up;
        R = 400 * up;
      } else {
        scale = uv;
        const heroHeight = vh;
        const frameX = vw - 1440 * uv;
        const frameY = Math.min(0, (heroHeight - 900 * uv) / 2);
        cx = frameX + 1166 * uv;
        cy = frameY + 530 * uv;
        R = 400 * uv;
      }

      const viewLon = prefersReducedMotion ? (-10 * Math.PI) / 180 : ((-10 - tSec * 2.4) * Math.PI) / 180;
      const cosV = Math.cos(viewLon);
      const sinV = Math.sin(viewLon);

      function project(pt: { x: number; y: number; z: number }) {
        const x1 = pt.x * cosV - pt.z * sinV;
        const y1 = pt.y;
        const z1 = pt.x * sinV + pt.z * cosV;
        const x2 = x1;
        const y2 = y1 * cosTilt - z1 * sinTilt;
        const z2 = y1 * sinTilt + z1 * cosTilt;
        return {
          x: cx + R * x2,
          y: cy - R * y2,
          z: z2,
          nx: x2,
          ny: y2,
        };
      }

      // 1. Haze and rim glow
      const hazeGrad = ctx.createRadialGradient(
        cx - 0.05 * R,
        cy + 0.08 * R,
        0.9 * R,
        cx - 0.05 * R,
        cy + 0.08 * R,
        1.5 * R
      );
      hazeGrad.addColorStop(0, 'rgba(47,99,255,0.55)');
      hazeGrad.addColorStop(0.12, 'rgba(90,128,255,0.32)');
      hazeGrad.addColorStop(0.4, 'rgba(169,188,255,0.16)');
      hazeGrad.addColorStop(1, 'rgba(238,242,255,0)');
      ctx.fillStyle = hazeGrad;
      ctx.beginPath();
      ctx.arc(cx - 0.05 * R, cy + 0.08 * R, 1.5 * R, 0, 2 * Math.PI);
      ctx.fill();

      // 2. Sphere body
      const bodyGrad = ctx.createRadialGradient(
        cx + 0.3 * R,
        cy - 0.42 * R,
        0.05 * R,
        cx + 0.1 * R,
        cy - 0.15 * R,
        1.25 * R
      );
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.55, '#f6f8ff');
      bodyGrad.addColorStop(0.85, '#e8eeff');
      bodyGrad.addColorStop(1, '#d5dfff');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fill();

      // 3. Inner shading clipped to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.clip();

      const limbGrad = ctx.createRadialGradient(cx, cy, 0.8 * R, cx, cy, R);
      limbGrad.addColorStop(0, 'rgba(47,99,255,0)');
      limbGrad.addColorStop(0.75, 'rgba(47,99,255,0.10)');
      limbGrad.addColorStop(1, 'rgba(47,99,255,0.42)');
      ctx.fillStyle = limbGrad;
      ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);

      const blGrad = ctx.createLinearGradient(cx - 0.8 * R, cy + 0.8 * R, cx + 0.2 * R, cy - 0.2 * R);
      blGrad.addColorStop(0, 'rgba(47,99,255,0.30)');
      blGrad.addColorStop(1, 'rgba(47,99,255,0)');
      ctx.fillStyle = blGrad;
      ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);

      // 4. Land dots in 5 depth buckets
      const buckets: { x: number; y: number; r: number }[][] = [[], [], [], [], []];
      const dotBaseRadius = Math.max(0.9, 1.75 * scale);

      for (let i = 0; i < dots.length; i++) {
        const p = project(dots[i]);
        if (p.z > 0.02) {
          const b = Math.min(4, Math.max(0, Math.floor(p.z * 5.5)));
          const rDot = dotBaseRadius * (0.5 + 0.5 * Math.sqrt(p.z));
          buckets[b].push({ x: p.x, y: p.y, r: rDot });
        }
      }

      for (let b = 0; b < 5; b++) {
        const list = buckets[b];
        if (!list.length) continue;
        ctx.fillStyle = '#111111';
        ctx.globalAlpha = introAlpha * scrollDim * (0.22 + b * 0.19);
        ctx.beginPath();
        for (let k = 0; k < list.length; k++) {
          const d = list[k];
          ctx.moveTo(d.x + d.r, d.y);
          ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        }
        ctx.fill();
      }

      ctx.restore(); // Restore clip
      ctx.globalAlpha = introAlpha * scrollDim;

      // 5. Rim circle + highlight arc
      ctx.lineWidth = Math.max(1, 1.4 * scale);
      ctx.strokeStyle = 'rgba(47,99,255,0.38)';
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, R - 0.8, -2.4, -0.3);
      ctx.stroke();

      // 6. Route Arcs
      ctx.lineWidth = Math.max(1, 1.15 * scale);
      ctx.strokeStyle = 'rgba(47,99,255,0.8)';

      for (let i = 0; i < arcsData.length; i++) {
        const arc = arcsData[i];
        const arcStartTime = 1.0 + i * 0.18;
        const arcProg = prefersReducedMotion ? 1 : Math.max(0, Math.min(1, (tSec - arcStartTime) / 1.1));
        if (arcProg <= 0) continue;

        const totalPts = arc.pts.length;
        const drawCount = Math.floor(arcProg * (totalPts - 1));
        const frac = arcProg * (totalPts - 1) - drawCount;

        ctx.beginPath();
        let drawing = false;

        for (let j = 0; j <= drawCount; j++) {
          let pt = arc.pts[j];
          if (j === drawCount && frac > 0 && j < totalPts - 1) {
            const next = arc.pts[j + 1];
            pt = {
              x: pt.x + (next.x - pt.x) * frac,
              y: pt.y + (next.y - pt.y) * frac,
              z: pt.z + (next.z - pt.z) * frac,
            };
          }
          const pr = project(pt);
          const isVis = pr.z > 0 || pr.nx * pr.nx + pr.ny * pr.ny > 1.0;

          if (isVis) {
            if (!drawing) {
              ctx.moveTo(pr.x, pr.y);
              drawing = true;
            } else {
              ctx.lineTo(pr.x, pr.y);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      // 7. City pins & labels
      const labelSize = isPort ? Math.max(9.5, 12.5 * scale) : 12.5 * scale;
      const pinRadius = Math.max(3, 4.6 * scale);
      ctx.font = `500 ${labelSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      for (let i = 0; i < cities.length; i++) {
        const c = cities[i];
        const pinProg = prefersReducedMotion ? 1 : Math.max(0, Math.min(1, (tSec - (0.8 + i * 0.16)) / 0.6));
        if (pinProg <= 0) continue;

        const pr = project(c.vec);
        if (pr.z <= 0) continue;

        const pinAlpha = Math.max(0, Math.min(1, pr.z * 5)) * pinProg * (introAlpha * scrollDim);
        if (pinAlpha < 0.01) continue;

        ctx.save();
        ctx.globalAlpha = pinAlpha;

        // Cobalt dot
        ctx.fillStyle = '#2f63ff';
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pinRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 1.5px white ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#111111';
        const labelY = pr.y - (pinRadius + 0.55 * labelSize);
        ctx.fillText(c.name, pr.x, labelY);

        ctx.restore();
      }

      ctx.restore();
    }

    // GLITCH REVEAL
    function playGlitch(el: HTMLElement, delayMs = 0) {
      if (prefersReducedMotion) {
        el.classList.remove('ent');
        return;
      }
      const keyframes = [
        { offset: 0, opacity: 0, clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-0.05em)', textShadow: '-0.12em 0 0 rgba(47,99,255,0.8), 0.07em 0 0 rgba(17,17,17,0.25)' },
        { offset: 0.30, opacity: 1, clipPath: 'inset(0 38% 0 0)', transform: 'translateX(0.035em)', textShadow: '0.09em 0 0 rgba(47,99,255,0.65), -0.05em 0 0 rgba(17,17,17,0.3)' },
        { offset: 0.55, opacity: 0.8, clipPath: 'inset(0)', transform: 'translateX(-0.018em)', textShadow: '-0.045em 0 0 rgba(47,99,255,0.55), 0.025em 0 0 rgba(17,17,17,0.2)' },
        { offset: 0.78, opacity: 1, clipPath: 'inset(0)', transform: 'translateX(0.008em)', textShadow: '0.015em 0 0 rgba(47,99,255,0.35), 0 0 0 transparent' },
        { offset: 1, opacity: 1, clipPath: 'inset(0)', transform: 'none', textShadow: 'none' },
      ];
      setTimeout(() => {
        const anim = el.animate(keyframes, {
          duration: 900,
          easing: 'steps(14, end)',
          fill: 'backwards',
        });
        anim.onfinish = () => el.classList.remove('ent');
      }, delayMs);
    }

    function playFadeUp(el: HTMLElement, distPx: number, durMs: number, delayMs = 0) {
      if (prefersReducedMotion) {
        el.classList.remove('ent');
        return;
      }
      setTimeout(() => {
        const anim = el.animate(
          [
            { opacity: 0, transform: `translateY(${distPx}px)` },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: durMs,
            easing: 'cubic-bezier(.2, .7, .2, 1)',
            fill: 'backwards',
          }
        );
        anim.onfinish = () => el.classList.remove('ent');
      }, delayMs);
    }

    // Hero load timeline
    if (!prefersReducedMotion) {
      if (logoRef.current) playFadeUp(logoRef.current, 8, 700, 0);
      if (vnavRef.current) {
        const vlinks = vnavRef.current.querySelectorAll('li');
        if (vlinks[0]) playFadeUp(vlinks[0], 8, 700, 70);
        if (vlinks[1]) playFadeUp(vlinks[1], 8, 700, 140);
        if (vlinks[2]) playFadeUp(vlinks[2], 8, 700, 210);
        vnavRef.current.classList.remove('ent');
      }

      const overlineEl = document.querySelector('.overline') as HTMLElement;
      if (overlineEl) playFadeUp(overlineEl, 10, 700, 150);

      const headlineLines = document.querySelectorAll('.hl .ln') as NodeListOf<HTMLElement>;
      if (headlineLines[0]) playGlitch(headlineLines[0], 260);
      if (headlineLines[1]) playGlitch(headlineLines[1], 390);
      if (headlineLines[2]) playGlitch(headlineLines[2], 520);

      setTimeout(() => {
        entranceFinished = true;
      }, 520 + 900);

      const ledeEl = document.querySelector('.lede') as HTMLElement;
      if (ledeEl) playFadeUp(ledeEl, 14, 800, 900);

      const btnsEl = document.querySelector('.btns') as HTMLElement;
      if (btnsEl) playFadeUp(btnsEl, 14, 800, 1040);
    } else {
      entranceFinished = true;
    }

    // HORIZON GLOW LOGIC
    function easeInOutQuad(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function updateGlow(scrollY: number) {
      if (!hzRef.current || !heroRef.current || !copyRef.current || !logoRef.current || !vnavRef.current) return;
      const wrapperHeight = isSticky ? 1.65 * vh : Math.max(1.65 * vh, (heroRef.current ? heroRef.current.clientHeight : vh) + 0.12 * vh);
      const e = (wrapperHeight - scrollY) / vh - 0.47;
      currentGlowE = e;

      let drawnEdge: number;
      if (e > 0.12) {
        drawnEdge = e;
      } else {
        drawnEdge = -0.03 + 0.15 * Math.exp((e - 0.12) / 0.15);
      }

      const glowOpacity = 1 - easeInOutQuad(Math.max(0, Math.min(1, (-0.12 - e) / 0.4)));

      if (glowOpacity < 0.002 || e > 1.04) {
        hzRef.current.style.display = 'none';
      } else {
        hzRef.current.style.display = 'block';
        hzRef.current.style.opacity = `${glowOpacity}`;

        const Rx = Math.max(0.75 * vw, 0.9 * vh);
        const Ry = 0.72 * vh;
        const centerY = drawnEdge * vh - Ry;

        hzRef.current.style.background = `radial-gradient(${Rx}px ${Ry}px at 50% ${centerY}px,
          rgba(255,255,255,0) 0px,
          rgba(238,242,255,0) ${0.985 * Rx}px,
          rgba(214,224,255,0.6) ${1.00 * Rx}px,
          #9fb2ff ${1.06 * Rx}px,
          #5a80ff ${1.14 * Rx}px,
          #2f63ff ${1.236 * Rx}px,
          #5a80ff ${1.32 * Rx}px,
          #a9bcff ${1.42 * Rx}px,
          #dfe6ff ${1.53 * Rx}px,
          #ffffff ${1.65 * Rx}px
        )`;
      }

      if (isSticky) {
        heroRef.current.style.visibility = e < -0.06 ? 'hidden' : 'visible';
      } else {
        heroRef.current.style.visibility = 'visible';
      }

      const k = Math.max(0, Math.min(1, (0.95 - e) / 0.42));
      copyRef.current.style.opacity = `${1 - k}`;
      copyRef.current.style.transform = `translateY(${-5 * k}vh)`;

      const navLogoAlpha = 1 - Math.max(0, Math.min(1, (0.85 - e) / 0.4));
      logoRef.current.style.opacity = `${navLogoAlpha}`;
      vnavRef.current.style.opacity = `${navLogoAlpha}`;

      const headlineLines = document.querySelectorAll('.hl .ln') as NodeListOf<HTMLElement>;
      if (entranceFinished && !prefersReducedMotion) {
        if (k > 0 && k < 1) {
          const j = (((Math.floor(k * 16) * 9301 + 49297) % 233280) / 233280 - 0.5);
          const o = j * 0.09;
          const clipP = Math.min(100, Math.max(0, k * k * 100));

          headlineLines.forEach((ln, idx) => {
            const sign = idx % 2 === 1 ? -1 : 1;
            const off = o * sign;
            ln.style.transform = `translateX(${off}em)`;
            ln.style.textShadow = `${-1.6 * off}em 0 0 rgba(47,99,255,${0.7 * k + 0.15}), ${0.8 * off}em 0 0 rgba(17,17,17,0.25)`;
            ln.style.clipPath = `inset(0 ${clipP.toFixed(2)}% 0 0)`;
          });
        } else if (k >= 1) {
          headlineLines.forEach((ln) => {
            ln.style.clipPath = 'inset(0 100% 0 0)';
          });
        } else {
          headlineLines.forEach((ln) => {
            ln.style.transform = 'none';
            ln.style.textShadow = 'none';
            ln.style.clipPath = 'inset(0)';
          });
        }
      }
    }

    // STATS OBSERVERS
    const statsObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            obs.unobserve(target);

            if (target.id === 'port-ph') {
              target.style.transition = 'clip-path 1.1s cubic-bezier(.7, 0, .2, 1)';
              target.style.clipPath = 'inset(0)';
              const img = target.querySelector('i');
              if (img) {
                img.style.transition = 'transform 1.6s cubic-bezier(.2, .7, .2, 1)';
                img.style.transform = 'scale(1)';
              }
              const introEl = document.getElementById('stats-intro');
              if (introEl) {
                setTimeout(() => {
                  introEl.style.transition = 'opacity 0.9s cubic-bezier(.2, .7, .2, 1), transform 0.9s cubic-bezier(.2, .7, .2, 1)';
                  introEl.style.opacity = '1';
                  introEl.style.transform = 'translateY(0)';
                }, 250);
              }
            }

            if (target.id === 'stats-hl') {
              const lines = target.querySelectorAll('.ln') as NodeListOf<HTMLElement>;
              lines.forEach((ln, idx) => {
                playGlitch(ln, idx * 130);
              });
            }

            if (target.tagName.toLowerCase() === 'li') {
              target.style.transition = 'opacity 0.7s cubic-bezier(.2, .7, .2, 1), transform 0.7s cubic-bezier(.2, .7, .2, 1)';
              target.style.opacity = '1';
              target.style.transform = 'translateY(0)';

              const numEl = target.querySelector('.n') as HTMLElement;
              setTimeout(() => {
                if (numEl) playGlitch(numEl, 0);
                target.style.setProperty('--hl', '1');
              }, 60);

              const val = target.dataset.val;
              const fmt = target.dataset.fmt;
              const suffix = target.dataset.suffix || '';

              if (fmt !== 'text' && !prefersReducedMotion && val) {
                const targetNum = parseFloat(val);
                const dur = 1600;
                const cStartTime = performance.now();

                function stepCount(cTime: number) {
                  const elapsed = cTime - cStartTime;
                  const prog = Math.min(1, elapsed / dur);
                  const easeOut = 1 - Math.pow(1 - prog, 3);
                  const curr = targetNum * easeOut;

                  if (numEl) {
                    if (fmt === 'int-space') {
                      const rounded = Math.round(curr);
                      const formatted = rounded > 999 ? String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F') : String(rounded);
                      numEl.textContent = formatted + suffix;
                    } else if (fmt === 'dec1') {
                      numEl.textContent = curr.toFixed(1) + suffix;
                    } else if (fmt === 'int') {
                      numEl.textContent = Math.round(curr) + suffix;
                    }
                  }

                  if (prog < 1) {
                    requestAnimationFrame(stepCount);
                  } else if (numEl) {
                    if (fmt === 'int-space') {
                      numEl.textContent = String(targetNum).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F') + suffix;
                    } else if (fmt === 'dec1') {
                      numEl.textContent = targetNum.toFixed(1) + suffix;
                    } else {
                      numEl.textContent = targetNum + suffix;
                    }
                  }
                }
                requestAnimationFrame(stepCount);
              } else if (fmt === 'text' && numEl && val) {
                numEl.textContent = val;
              }
            }
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -15% 0px',
      }
    );

    const phEl = document.getElementById('port-ph');
    const statsHlEl = document.getElementById('stats-hl');
    const statItems = document.querySelectorAll('#stats-nums li');

    if (phEl) statsObserver.observe(phEl);
    if (statsHlEl) statsObserver.observe(statsHlEl);
    statItems.forEach((li) => statsObserver.observe(li));

    // SERVICES SCROLL & VIDEO SCRUBBING
    let curVidTime = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let smoothSpeed = 0;

    const cards = document.querySelectorAll('.card') as NodeListOf<HTMLElement>;

    function updateServices(scrollY: number, nowTime: number) {
      if (!trackRef.current || !videoRef.current || !speedRef.current) return;
      const trackTop = trackRef.current.offsetTop;
      const q = Math.max(0, Math.min(1, (scrollY - trackTop) / (A * vh)));

      const duration = videoRef.current.duration || 4.04;
      const targetVidTime = q * (duration - 1 / 48);
      curVidTime += (targetVidTime - curVidTime) * 0.2;

      if (!videoRef.current.seeking && Math.abs(videoRef.current.currentTime - curVidTime) > 1 / 60) {
        videoRef.current.currentTime = curVidTime;
      }

      if (q >= 0.94) {
        setIsSettled(true);
        if (sceneRef.current) sceneRef.current.classList.add('settled');
      } else {
        setIsSettled(false);
        if (sceneRef.current) sceneRef.current.classList.remove('settled');
      }

      const r = Math.max(0, Math.min(1, (scrollY - trackTop - A * vh) / (B * vh)));
      const stripWidth = stripRef.current ? stripRef.current.scrollWidth : 2000;
      const lettersWidth = giantLettersRef.current ? giantLettersRef.current.scrollWidth : 1800;

      const stripTrans = vw - r * (stripWidth + 0.45 * vw);
      const lettersTrans = vw - r * (lettersWidth + vw);

      if (stripRef.current) stripRef.current.style.transform = `translate3d(${stripTrans}px, 0, 0)`;
      if (giantLettersRef.current) giantLettersRef.current.style.transform = `translate3d(${lettersTrans}px, 0, 0)`;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardLeft = rect.left;
        const s = Math.max(-0.4, Math.min(1.6, (0.98 - cardLeft / vw) / 0.3)) * 100;
        card.style.setProperty('--s', `${s.toFixed(1)}%`);
      });

      const dt = (nowTime - lastScrollTime) / 1000;
      lastScrollTime = nowTime;
      const dy = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;

      const instant = dt > 0 ? dy / dt / 32 : 0;
      smoothSpeed += (instant - smoothSpeed) * 0.1;
      const disp = Math.min(99, Math.round(smoothSpeed));
      speedRef.current.textContent = `${String(disp).padStart(2, '0')} KM/H`;
    }

    // MAIN rAF LOOP
    let animFrameId: number;
    function mainLoop(now: number) {
      const scrollY = window.scrollY;
      drawGlobe(now);
      updateGlow(scrollY);
      updateServices(scrollY, now);

      if (!isRecorder) {
        animFrameId = requestAnimationFrame(mainLoop);
      }
    }

    if (!isRecorder) {
      animFrameId = requestAnimationFrame(mainLoop);
    } else {
      requestAnimationFrame((now) => {
        drawGlobe(now);
        updateGlow(window.scrollY);
        updateServices(window.scrollY, now);
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrameId);
      statsObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full bg-white text-[#111111] overflow-x-clip selection:bg-[#2f63ff] selection:text-white">
      {/* Global Embedded Styles for KV Freight Aesthetic */}
      <style jsx global>{`
        @font-face {
          font-family: 'Anton';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Archivo';
          font-style: normal;
          font-weight: 400 800;
          font-display: swap;
          src: url('https://fonts.gstatic.com/s/archivo/v25/k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLydOxI.woff2') format('woff2');
        }
        @font-face {
          font-family: 'JetBrains Mono';
          font-style: normal;
          font-weight: 400 500;
          font-display: swap;
          src: url('https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2') format('woff2');
        }

        :root {
          --ink: #111111;
          --white: #ffffff;
          --cobalt: #2f63ff;
          --cobalt-hover: #1f4fe0;
          --muted: #5d6270;
          --muted-2: #6b6f78;
          --wash: #eef2ff;
          --periwinkle: #a9bcff;
          --giant: #e9e9e9;
          --hairline: #d9dbe0;
          
          --uc: 1px;
          --uv: 1px;
          --us: 1px;
          --u: 1px;
          --edge-px: 500px;
          --hl: 1;
        }

        .js-anim .ent {
          opacity: 0;
        }
        .anim-done .ent {
          opacity: 1 !important;
        }

        /* SECTION 1: GLOBE HERO */
        .hwrap {
          position: relative;
          width: 100%;
          height: 165vh;
          z-index: 1;
        }
        section.hero {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          height: 100svh;
          background: var(--white);
          overflow: hidden;
          z-index: 1;
          transition: visibility 0.1s;
        }
        html:not(.sticky) .hwrap {
          height: auto;
        }
        html:not(.sticky) section.hero {
          position: relative;
          height: auto;
          min-height: 100svh;
        }

        .gwrap {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }
        #globe {
          display: block;
          width: 100%;
          height: 100%;
        }

        .hf {
          position: absolute;
          left: 0;
          width: calc(1440 * var(--uc));
          height: calc(900 * var(--uc));
          top: max(0px, calc((100vh - 900 * var(--uc)) / 2));
          pointer-events: none;
          z-index: 2;
        }
        .hf > * {
          pointer-events: auto;
        }

        .logo {
          position: absolute;
          left: calc(40 * var(--uc));
          top: calc(36 * var(--uc));
          width: calc(71 * var(--uc));
          display: block;
          line-height: 0;
          text-decoration: none;
        }
        .logo svg {
          width: 100%;
          height: auto;
          display: block;
          fill: var(--ink);
        }

        .vnav {
          position: absolute;
          left: calc(218 * var(--uc));
          top: calc(77 * var(--uc));
          list-style: none;
        }
        .vnav li {
          padding: calc(6.1 * var(--uc)) 0;
        }
        .vnav a {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 400;
          font-size: max(calc(13 * var(--uc)), 11px);
          line-height: 1;
          letter-spacing: .09em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          transition: color .2s ease;
          display: inline-block;
        }
        .vnav a:hover {
          color: var(--cobalt);
        }

        .copy {
          position: absolute;
          left: calc(218 * var(--uc));
          top: calc(294 * var(--uc));
          width: calc(560 * var(--uc));
        }

        .overline {
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 700;
          font-size: max(calc(19.2 * var(--uc)), 12px);
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: -.005em;
          color: var(--cobalt);
        }

        .hl {
          margin-top: calc(7 * var(--uc));
          font-family: 'Anton', Impact, sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          font-size: calc(114.3 * var(--uc));
          line-height: .953;
          letter-spacing: -.004em;
          color: var(--ink);
        }
        .hl .ln {
          display: block;
          white-space: nowrap;
          will-change: transform, clip-path, text-shadow;
        }

        .lede {
          margin-top: calc(21 * var(--uc));
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 400;
          font-size: max(calc(18.2 * var(--uc)), 13px);
          line-height: 1.45;
          color: var(--muted);
          max-width: max(calc(418 * var(--uc)), 250px);
        }

        .btns {
          margin-top: calc(19 * var(--uc));
          display: flex;
          flex-direction: row;
          gap: calc(15 * var(--uc));
          flex-wrap: wrap;
        }

        .btn-kv {
          height: max(calc(40 * var(--uc)), 34px);
          padding: 0 max(calc(25 * var(--uc)), 16px);
          border-radius: 999px;
          border: 1.3px solid var(--cobalt);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 400;
          font-size: max(calc(12 * var(--uc)), 11px);
          letter-spacing: .09em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background-color .25s ease, color .25s ease, border-color .25s ease;
          cursor: pointer;
        }

        .btn-kv-primary {
          background-color: var(--cobalt);
          color: var(--white);
        }
        .btn-kv-primary:hover {
          background-color: var(--cobalt-hover);
          border-color: var(--cobalt-hover);
        }

        .btn-kv-outline {
          background-color: transparent;
          color: var(--cobalt);
        }
        .btn-kv-outline:hover {
          background-color: var(--cobalt);
          color: var(--white);
        }

        /* SECTION 2: HORIZON GLOW & STATS */
        .hz {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          display: none;
        }

        section.stats {
          position: relative;
          z-index: 3;
          background: transparent;
          width: 100%;
        }

        .pin {
          position: sticky;
          top: min(0px, calc(100vh - calc(900 * var(--us))));
          height: calc(900 * var(--us));
          z-index: 1;
          pointer-events: none;
        }
        .pin > * {
          pointer-events: auto;
        }

        .ph {
          position: absolute;
          left: calc(64 * var(--us));
          top: calc(93 * var(--us));
          width: calc(440 * var(--us));
          height: calc(236 * var(--us));
          overflow: hidden;
          background: #1d3b44;
          clip-path: inset(100% 0 0 0);
          will-change: clip-path;
        }
        .ph i {
          display: block;
          position: absolute;
          inset: 0;
          background: url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261116_131941_31d10ef7-4bff-4a6b-94a7-27e15c950f26.png&w=1200&q=85') 50% 50% / cover no-repeat;
          transform: scale(1.12);
          will-change: transform;
        }

        .big {
          position: absolute;
          left: calc(64 * var(--us));
          top: calc(383 * var(--us));
          font-family: 'Anton', Impact, sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          font-size: calc(105 * var(--us));
          line-height: 1;
          letter-spacing: .02em;
          color: var(--ink);
        }
        .big .ln {
          display: block;
          white-space: nowrap;
          will-change: transform, clip-path, text-shadow;
        }

        .col {
          position: relative;
          margin-top: calc(-900 * var(--us));
          height: calc((371 + 5 * 166 + 140) * var(--us));
          pointer-events: auto;
        }

        .intro {
          position: absolute;
          left: calc(594 * var(--us));
          top: calc(117 * var(--us));
          width: calc(440 * var(--us));
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 400;
          font-size: max(calc(17.9 * var(--us)), 12.5px);
          line-height: 1.36;
          color: var(--muted-2);
          transform: translateY(14px);
          opacity: 0;
          will-change: transform, opacity;
        }
        .intro p + p {
          margin-top: calc(24 * var(--us));
        }
        .intro-links {
          margin-top: calc(22 * var(--us));
          display: flex;
          flex-direction: row;
          gap: calc(26 * var(--us));
        }
        .slink {
          color: var(--ink);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: .28em;
          transition: color .2s ease;
        }
        .slink:hover {
          color: var(--cobalt);
        }

        .nums {
          position: absolute;
          left: calc(993 * var(--us));
          top: calc(371 * var(--us));
          width: calc(384 * var(--us));
          list-style: none;
        }
        .nums li {
          position: relative;
          height: calc(166 * var(--us));
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          opacity: 0;
          transform: translateY(12px);
          will-change: transform, opacity;
        }
        .nums li + li::before {
          content: '';
          position: absolute;
          top: calc(-16 * var(--us));
          left: 0;
          right: 0;
          height: 1px;
          background: var(--hairline);
          transform: scaleX(var(--hl, 0));
          transform-origin: left;
          will-change: transform;
        }

        .nums .n {
          font-family: 'Anton', Impact, sans-serif;
          font-weight: 400;
          font-size: calc(82 * var(--us));
          line-height: 1;
          color: var(--cobalt);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          will-change: transform, clip-path, text-shadow;
        }
        .nums .c {
          margin-top: calc(6 * var(--us));
          font-family: 'Archivo', system-ui, sans-serif;
          font-size: max(calc(17 * var(--us)), 11.5px);
          line-height: 1.3;
          color: var(--muted-2);
        }

        /* SECTION 3: SERVICES SCENE */
        section.track {
          position: relative;
          z-index: 4;
          background: var(--white);
          width: 100%;
        }

        .scene {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100lvh;
          overflow: hidden;
          background: var(--white);
        }

        #svc-video {
          position: absolute;
          display: block;
          pointer-events: none;
          user-select: none;
          object-fit: fill;
        }

        .giant-letters {
          position: absolute;
          left: 0;
          top: calc(var(--edge-px) - calc(264 * var(--u)));
          font-family: 'Anton', Impact, sans-serif;
          font-size: calc(330 * var(--u));
          line-height: .8;
          color: var(--giant);
          text-transform: uppercase;
          white-space: nowrap;
          mix-blend-mode: darken;
          pointer-events: none;
          user-select: none;
          z-index: 2;
          will-change: transform;
        }

        .readout {
          position: absolute;
          left: calc(26 * var(--u));
          top: calc(52 * var(--u));
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 400;
          font-size: calc(10.5 * var(--u));
          letter-spacing: .06em;
          color: var(--ink);
          z-index: 3;
          opacity: 0;
          transition: opacity .5s ease;
          pointer-events: none;
        }

        .band {
          position: absolute;
          left: 0;
          right: 0;
          top: var(--edge-px);
          bottom: 0;
          background: #111111;
          color: var(--white);
          overflow: hidden;
          z-index: 3;
        }

        .strip {
          position: absolute;
          top: calc(76 * var(--u));
          left: 0;
          display: flex;
          flex-direction: row;
          gap: calc(120 * var(--u));
          align-items: flex-start;
          white-space: normal;
          will-change: transform;
        }

        .lead-block {
          display: flex;
          flex-direction: row;
          gap: calc(64 * var(--u));
          align-items: flex-start;
          flex-shrink: 0;
        }

        .lead-hl {
          font-family: 'Anton', Impact, sans-serif;
          font-size: calc(64 * var(--u));
          line-height: .98;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .lead-hl span {
          display: block;
        }
        .lead-hl .co {
          color: var(--cobalt);
        }

        .lead-paras {
          width: calc(250 * var(--u));
          display: flex;
          flex-direction: column;
          gap: 1em;
          font-family: 'Archivo', system-ui, sans-serif;
          font-size: calc(12 * var(--u));
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.62);
        }

        .card {
          width: calc(270 * var(--u));
          padding-left: calc(30 * var(--u));
          padding-right: calc(30 * var(--u));
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .card:first-of-type {
          border-left: none;
        }

        .card-icon {
          width: calc(38 * var(--u));
          height: calc(38 * var(--u));
          display: block;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .card-title {
          margin-top: calc(22 * var(--u));
          font-family: 'Anton', Impact, sans-serif;
          font-size: calc(26 * var(--u));
          line-height: 1.05;
          text-transform: uppercase;
          background: linear-gradient(90deg, #ffffff calc(var(--s, 0%) - 34%), #2f63ff calc(var(--s, 0%) - 6%), transparent calc(var(--s, 0%) + 26%));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .card-body {
          margin-top: calc(14 * var(--u));
          font-family: 'Archivo', system-ui, sans-serif;
          font-size: calc(12.4 * var(--u));
          line-height: 1.5;
          background: linear-gradient(90deg, #ffffff calc(var(--s, 0%) - 34%), #2f63ff calc(var(--s, 0%) - 6%), transparent calc(var(--s, 0%) + 26%));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .pill-services {
          position: absolute;
          bottom: calc(36 * var(--u));
          left: 50%;
          transform: translate(-50%, 24px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 999px;
          padding: calc(11 * var(--u)) calc(22 * var(--u));
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 500;
          font-size: calc(10 * var(--u));
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #ffffff;
          text-decoration: none;
          opacity: 0;
          pointer-events: none;
          transition: opacity .6s cubic-bezier(.2, .7, .2, 1), transform .6s cubic-bezier(.2, .7, .2, 1);
          z-index: 4;
        }
        .pill-services:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .scene.settled .readout {
          opacity: 1;
        }
        .scene.settled .pill-services {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }

        /* PORTRAIT MODE (m-port) & MOBILE VIEWPORTS */
        html.m-port .hwrap,
        @media (max-width: 768px) {
          .hwrap {
            height: auto !important;
          }
        }

        html.m-port section.hero,
        @media (max-width: 768px) {
          section.hero {
            position: relative !important;
            height: auto !important;
            min-height: 100svh !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
        }

        html.m-port .hf,
        @media (max-width: 768px) {
          .hf {
            order: 1 !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            top: 0 !important;
            left: 0 !important;
            padding: 22px 22px 0 22px !important;
            display: flex !important;
            flex-direction: column !important;
          }
        }

        html.m-port .logo,
        @media (max-width: 768px) {
          .logo {
            position: absolute !important;
            left: 22px !important;
            top: 20px !important;
            width: 58px !important;
            z-index: 10 !important;
          }
        }

        html.m-port .vnav,
        @media (max-width: 768px) {
          .vnav {
            position: absolute !important;
            right: 22px !important;
            top: 20px !important;
            left: auto !important;
            text-align: right !important;
            z-index: 10 !important;
          }
          .vnav li {
            padding: 4px 0 !important;
          }
          .vnav a {
            font-size: 12px !important;
          }
        }

        html.m-port .copy,
        @media (max-width: 768px) {
          .copy {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin-top: clamp(48px, 10vh, 96px) !important;
          }
        }

        html.m-port .overline,
        @media (max-width: 768px) {
          .overline {
            font-size: 14px !important;
          }
        }

        html.m-port .hl,
        @media (max-width: 768px) {
          .hl {
            font-size: min(23vw, 150px) !important;
            margin-top: 12px !important;
            line-height: 0.95 !important;
          }
        }

        html.m-port .lede,
        @media (max-width: 768px) {
          .lede {
            font-size: 15px !important;
            max-width: 420px !important;
            margin-top: 20px !important;
            line-height: 1.45 !important;
          }
        }

        html.m-port .btns,
        @media (max-width: 768px) {
          .btns {
            margin-top: 20px !important;
            gap: 10px !important;
          }
          .btn-kv {
            height: 40px !important;
            padding: 0 20px !important;
            font-size: 11px !important;
          }
        }

        html.m-port .gwrap,
        @media (max-width: 768px) {
          .gwrap {
            order: 2 !important;
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: 98vw !important;
            margin-top: 16px !important;
            overflow: hidden !important;
            -webkit-mask-image: linear-gradient(to bottom, black 72%, transparent 100%) !important;
            mask-image: linear-gradient(to bottom, black 72%, transparent 100%) !important;
          }
        }

        /* STATS IN PORTRAIT, SHORT LAND & MOBILE VIEWPORTS */
        html.m-port section.stats,
        html.m-land section.stats,
        @media (max-width: 768px) {
          section.stats {
            padding: 56px 22px 72px 22px !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
          }
          .pin, .col {
            position: static !important;
            display: contents !important;
            height: auto !important;
            margin: 0 !important;
          }
          .ph {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 620px !important;
            aspect-ratio: 440 / 236 !important;
            height: auto !important;
            order: 1 !important;
            margin-bottom: 28px !important;
            clip-path: inset(0) !important;
          }
          .intro {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 520px !important;
            font-size: 15px !important;
            order: 2 !important;
            margin-bottom: 48px !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .intro p + p {
            margin-top: 16px !important;
          }
          .intro-links {
            margin-top: 18px !important;
            display: flex !important;
            flex-direction: row !important;
            gap: 20px !important;
          }
          .big {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            font-size: min(15.5vw, 120px) !important;
            order: 3 !important;
            margin-bottom: 44px !important;
          }
          .nums {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            order: 4 !important;
          }
          .nums li {
            height: auto !important;
            padding: 18px 0 !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .nums li + li::before {
            top: 0 !important;
          }
          .nums .n {
            font-size: min(19vw, 100px) !important;
          }
          .nums .c {
            font-size: 14px !important;
            margin-top: 4px !important;
          }
        }

        /* SERVICES IN PHONE FRAMING (m-hp) & MOBILE VIEWPORTS */
        html.m-hp .readout,
        @media (max-width: 768px) {
          .readout {
            left: 20px !important;
            top: 22px !important;
            font-size: 11px !important;
          }
          .strip {
            top: calc(44 * var(--u)) !important;
            gap: calc(56 * var(--u)) !important;
            padding-left: 22px !important;
          }
          .lead-block {
            flex-direction: column !important;
            gap: calc(24 * var(--u)) !important;
          }
          .lead-hl {
            font-size: calc(46 * var(--u)) !important;
          }
          .lead-paras {
            width: calc(300 * var(--u)) !important;
            font-size: 13px !important;
          }
          .card {
            width: calc(250 * var(--u)) !important;
          }
          .card-body {
            font-size: 13px !important;
          }
        }

        /* SHORT LANDSCAPE (m-land) */
        html.m-land .strip {
          top: calc(14 * var(--u));
          gap: calc(48 * var(--u));
        }
        html.m-land .lead-block {
          flex-direction: row;
          gap: calc(28 * var(--u));
        }
        html.m-land .lead-hl {
          font-size: calc(34 * var(--u));
        }
        html.m-land .lead-paras {
          width: calc(230 * var(--u));
          font-size: max(calc(12 * var(--u)), 10px);
        }
        html.m-land .card {
          width: calc(240 * var(--u));
        }
        html.m-land .card-icon {
          width: calc(30 * var(--u));
          height: calc(30 * var(--u));
        }
        html.m-land .card-title {
          font-size: calc(22 * var(--u));
          margin-top: calc(12 * var(--u));
        }
        html.m-land .card-body {
          font-size: max(calc(12 * var(--u)), 10px);
        }
        html.m-land .pill-services {
          bottom: calc(12 * var(--u));
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          .ent {
            opacity: 1 !important;
            transform: none !important;
            clip-path: none !important;
            text-shadow: none !important;
          }
          .ph, .ph i, .intro, .nums li {
            opacity: 1 !important;
            transform: none !important;
            clip-path: none !important;
          }
          .nums li + li::before {
            transform: scaleX(1) !important;
          }
        }
      `}</style>

      {/* Floating Operations / Voice Command Trigger */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full bg-[#111111]/95 hover:bg-[#2f63ff] text-white shadow-2xl hover:shadow-blue-500/30 font-mono text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-300 border border-white/20 backdrop-blur-md group"
        >
          <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2f63ff] group-hover:text-white transition-colors" />
          <span className="hidden xs:inline sm:inline">Launch Dashboard</span>
          <span className="inline xs:hidden sm:hidden">Dashboard</span>
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* SECTION 1: GLOBE HERO */}
      <div className="hwrap" ref={hwrapRef}>
        <section className="hero" id="top" ref={heroRef}>
          <div className="gwrap">
            <canvas id="globe" ref={canvasRef} />
          </div>
          <div className="hf">
            <a href="#top" className="logo ent" ref={logoRef} aria-label="KV Freight">
              <svg viewBox="0 0 71 31">
                <path d="M 0 0 H 9.4 V 11.8 L 21 0 H 32.5 L 17 15.5 L 33 31 H 21.5 L 9.4 17.5 V 31 H 0 Z" />
                <path d="M 33.5 0 H 44.5 L 50.5 20.5 L 56.5 0 H 67.5 L 56.5 31 H 44.5 Z" />
              </svg>
            </a>

            <ul className="vnav ent" ref={vnavRef}>
              <li><a href="#about">ABOUT</a></li>
              <li><a href="#services">SERVICES</a></li>
              <li><Link href="/dashboard" className="text-[#2f63ff] font-bold">DASHBOARD</Link></li>
            </ul>

            <div className="copy" ref={copyRef}>
              <div className="overline ent">ONE NETWORK</div>
              <h1 className="hl" ref={headlineRef}>
                <span className="ln ent">EVERY LEG</span>
                <span className="ln ent">OF THE</span>
                <span className="ln ent">ROUTE</span>
              </h1>
              <p className="lede ent">Air, ocean, road and customs brokerage, run as one network under one accountable team.</p>
              <div className="btns ent">
                <Link href="/dashboard" className="btn-kv btn-kv-primary">
                  MANAGE INVENTORY
                </Link>
                <a href="#services" className="btn-kv btn-kv-outline">
                  OUR SERVICES
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* HORIZON GLOW TRANSITION */}
      <div className="hz" id="hz" ref={hzRef} />

      {/* SECTION 2: STATS */}
      <section className="stats" id="about">
        <div className="pin">
          <div className="ph" id="port-ph">
            <i />
          </div>
          <h2 className="big" id="stats-hl">
            <span className="ln ent">WE MOVE</span>
            <span className="ln ent">FREIGHT.</span>
            <span className="ln ent">WE OWN</span>
            <span className="ln ent">THE OUTCOME.</span>
          </h2>
        </div>

        <div className="col">
          <div className="intro" id="stats-intro">
            <p>With every service under one roof, your supply chain moves the way your business demands.</p>
            <p>From ocean to air, road to rail, we bring together global reach, local expertise and technology-driven solutions to keep your cargo moving.</p>
            <div className="intro-links">
              <a href="#services" className="slink">Our services</a>
              <Link href="/dashboard" className="slink">Live tracking & stock</Link>
            </div>
          </div>

          <ul className="nums" id="stats-nums">
            <li data-val="2500" data-suffix="+" data-fmt="int-space">
              <span className="n ent">0+</span>
              <span className="c">Shipments per month</span>
            </li>
            <li data-val="98.2" data-suffix="%" data-fmt="dec1">
              <span className="n ent">0.0%</span>
              <span className="c">On-time delivery rate</span>
            </li>
            <li data-val="8" data-suffix="+" data-fmt="int">
              <span className="n ent">0+</span>
              <span className="c">Years in operation</span>
            </li>
            <li data-val="60" data-suffix="+" data-fmt="int">
              <span className="n ent">0+</span>
              <span className="c">Countries on our network</span>
            </li>
            <li data-val="24/7" data-fmt="text">
              <span className="n ent">24/7</span>
              <span className="c">Live shipment tracking</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 3: SERVICES SCROLL SCENE */}
      <section className="track" id="services" ref={trackRef}>
        <div className="scene" id="scene" ref={sceneRef}>
          <video
            id="svc-video"
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/2307e4bf-be39-42b4-b579-e168aeccabf0.jpg"
          >
            <source src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/409763c0-95f4-49d3-a601-dc564d55072b.mp4" type="video/mp4" media="(min-width: 901px)" />
            <source src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b3718419-7a0a-478d-bfb0-0ff8bef7f3f7.mp4" type="video/mp4" />
          </video>

          <div className="giant-letters" id="giant-letters" ref={giantLettersRef}>
            OUR SERVICES
          </div>
          <div className="readout" id="speed-readout" ref={speedRef}>
            00 KM/H
          </div>

          <div className="band" id="band">
            <div className="strip" id="strip" ref={stripRef}>
              <div className="lead-block">
                <div className="lead-hl">
                  <span>EVERYTHING YOUR</span>
                  <span>FREIGHT NEEDS.</span>
                  <span className="co">UNDER ONE GROUP.</span>
                </div>
                <div className="lead-paras">
                  <p>From air to sea, from customs clearance to the last mile, we bring decades of practice to every freight discipline.</p>
                  <p>One integrated network means one partner, one point of contact and full visibility from origin to destination.</p>
                </div>
              </div>

              {/* Card 1 */}
              <div className="card">
                <svg className="card-icon" viewBox="0 0 38 38">
                  <path d="M 6 22 L 17 18 L 17 6 C 17 4.5 21 4.5 21 6 L 21 18 L 32 22 L 32 25 L 21 21.5 L 21 29 L 24 32 L 24 34 L 19 32.5 L 14 34 L 14 32 L 17 29 L 17 21.5 L 6 25 Z" />
                </svg>
                <div className="card-title">AIR<br />FREIGHT</div>
                <div className="card-body">Express, priority and deferred options across global lanes, booked and tracked end to end.</div>
              </div>

              {/* Card 2 */}
              <div className="card">
                <svg className="card-icon" viewBox="0 0 38 38">
                  <path d="M 5 23 L 9 14 H 29 L 33 23 Z" />
                  <path d="M 14 14 V 9 H 24 V 14" />
                  <path d="M 19 6 V 9" />
                  <path d="M 3 28 C 6 26 9 26 12 28 C 15 30 18 30 21 28 C 24 26 27 26 30 28 C 33 30 36 30 38 28" />
                  <path d="M 3 32 C 6 30 9 30 12 32 C 15 34 18 34 21 32 C 24 30 27 30 30 32 C 33 34 36 34 38 32" />
                </svg>
                <div className="card-title">OCEAN<br />FREIGHT</div>
                <div className="card-body">FCL and LCL sailings on every major trade lane, with carrier choice based on cost and transit time.</div>
              </div>

              {/* Card 3 */}
              <div className="card">
                <svg className="card-icon" viewBox="0 0 38 38">
                  <path d="M 9 5 H 23 L 29 11 V 33 H 9 Z" />
                  <path d="M 23 5 V 11 H 29" />
                  <path d="M 15 22 L 18 25 L 24 17" />
                </svg>
                <div className="card-title">CUSTOMS<br />BROKERAGE</div>
                <div className="card-body">Licensed in-house brokers for classification, duties and inspections, so goods clear first time.</div>
              </div>

              {/* Card 4 */}
              <div className="card">
                <svg className="card-icon" viewBox="0 0 38 38">
                  <path d="M 4 14 L 19 5 L 34 14 V 33 H 4 Z" />
                  <path d="M 13 33 V 22 H 25 V 33" />
                  <path d="M 13 22 L 19 17 L 25 22" />
                </svg>
                <div className="card-title">WAREHOUSING<br />AND 3PL</div>
                <div className="card-body">Bonded and general storage, pick and pack, and distribution that plugs straight into transport.</div>
              </div>

              {/* Card 5 */}
              <div className="card">
                <svg className="card-icon" viewBox="0 0 38 38">
                  <path d="M 8 6 H 26 L 31 16" />
                  <path d="M 19 6 V 17" />
                  <path d="M 19 17 C 19 20 16 22 16 24 C 16 26 19 27 21 25" />
                  <rect x="10" y="27" width="18" height="7" rx="1" />
                </svg>
                <div className="card-title">PROJECT<br />CARGO</div>
                <div className="card-body">Oversized and heavy-lift moves, engineered, permitted and escorted from factory to foundation.</div>
              </div>
            </div>

            <a href="#services" className="pill-services">
              OUR SERVICES
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
