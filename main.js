/* ==========================================
   PIEDRA DE AGUA - CORE UTILITIES & ANIMATIONS (2026)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initCursor();
  initBackgroundCanvas();
  initMobileMenu();
  
  // Initialize Lenis smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  initScrollAnimations();
});

/* ==========================================
   1. THEME SWITCHER (DARK / LIGHT MODE)
   ========================================== */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(toggleBtn, currentTheme);

  toggleBtn.addEventListener('click', () => {
    document.body.classList.add('theme-transitioning');
    
    let theme = document.documentElement.getAttribute('data-theme');
    let nextTheme = theme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeIcon(toggleBtn, nextTheme);
    
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 850);
  });
}

function updateThemeIcon(btn, theme) {
  const icon = btn.querySelector('i');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'ph-bold ph-moon'; // Moon icon to switch to dark
    btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
  } else {
    icon.className = 'ph-bold ph-sun'; // Sun icon to switch to light
    btn.setAttribute('aria-label', 'Cambiar a modo claro');
  }
}

/* ==========================================
   2. FIXED HEADER (SHRINK ON SCROLL)
   ========================================== */
function initHeader() {
  const header = document.querySelector('header.header-nav');
  if (!header) return;

  const shrinkThreshold = 50;

  // Modern CSS-based Scroll timeline detection or scroll event fallback
  if (CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
    // We let the native CSS handle the shrink animation on scrollport
    // However, to apply classes for state tracking we can also track scroll
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > shrinkThreshold) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  });

  // Check initial state
  if (window.scrollY > shrinkThreshold) {
    header.classList.add('shrink');
  }
}

/* ==========================================
   3. GEOMETRIC CURSOR FOLLOWER & DYNAMIC TEXT
   ========================================== */
function initCursor() {
  // Disable custom cursor on touch devices
  if (window.matchMedia('(max-width: 1024px)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';
  const followerText = document.createElement('span');
  followerText.innerText = '';
  follower.appendChild(followerText);
  document.body.appendChild(follower);

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Direct dot positioning
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth lerp animation for the follower circle
  function animateFollower() {
    // Lerp factor = 0.12 for lag effect
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover triggers
  const hoverables = document.querySelectorAll('button, .btn-lux, [data-cursor-text]');
  
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      
      // Look for custom text attributes
      const text = el.getAttribute('data-cursor-text');
      if (text) {
        followerText.innerText = text;
      } else {
        followerText.innerText = '';
      }
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      followerText.innerText = '';
    });
  });
}

/* ==========================================
   4. MOBILE NAVIGATION DRAWER
   ========================================== */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  // Close when clicking a link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
}

/* ==========================================
   5. WEBGPU / WEBGL LIQUID GLASS SHADER
   ========================================== */
function initBackgroundCanvas() {
  const container = document.querySelector('.background-canvas-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const scaleFactor = 0.5; // Downscale rendering resolution for performance
  let width = canvas.width = Math.floor(container.clientWidth * scaleFactor);
  let height = canvas.height = Math.floor(container.clientHeight * scaleFactor);

  let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX * scaleFactor;
    mouse.targetY = e.clientY * scaleFactor;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = Math.floor(container.clientWidth * scaleFactor);
    height = canvas.height = Math.floor(container.clientHeight * scaleFactor);
    if (gl) gl.viewport(0, 0, width, height);
  });

  // Track scrolling to pause render loop during scroll for solid 60 FPS
  let isScrolling = false;
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 120);
  }, { passive: true });

  // Track visibility using IntersectionObserver to auto-throttle and save CPU/battery
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.1 });
  observer.observe(canvas);

  // Initialize WebGPU if available
  if (navigator.gpu) {
    initWebGPU(canvas);
  } else {
    initWebGLFallback(canvas);
  }

  /* --- WebGPU Renderer --- */
  async function initWebGPU(canvasElement) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error('No WebGPU adapter found');
      }
      const device = await adapter.requestDevice();
      
      const context = canvasElement.getContext('webgpu');
      const format = navigator.gpu.getPreferredCanvasFormat();
      
      context.configure({
        device: device,
        format: format,
        alphaMode: 'opaque'
      });

      // WGSL Shader code for smooth geothermal fluid waving
      const wgslCode = `
        struct Uniforms {
          resolution: vec2<f32>,
          mouse: vec2<f32>,
          time: f32,
          is_light_mode: f32,
        }

        @group(0) @binding(0) var<uniform> uniforms : Uniforms;

        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) uv: vec2<f32>,
        }

        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var pos = array<vec2<f32>, 4>(
            vec2<f32>(-1.0, -1.0),
            vec2<f32>(1.0, -1.0),
            vec2<f32>(-1.0, 1.0),
            vec2<f32>(1.0, 1.0)
          );
          
          var uv = array<vec2<f32>, 4>(
            vec2<f32>(0.0, 1.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(1.0, 0.0)
          );
          
          var out: VertexOutput;
          out.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
          out.uv = uv[vertexIndex];
          return out;
        }

        @fragment
        fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
          let time = uniforms.time * 0.15;
          let p = (uv * 2.0 - 1.0) * vec2<f32>(uniforms.resolution.x / uniforms.resolution.y, 1.0);
          
          // Geothermal fluid waving
          var coord = p;
          for (var i = 1; i < 5; i = i + 1) {
            let f = f32(i);
            coord.x += 0.3 / f * sin(f * coord.y + time + uniforms.mouse.x * 0.002) + 0.5;
            coord.y += 0.3 / f * cos(f * coord.x + time + uniforms.mouse.y * 0.002) - 0.5;
          }
          
          let pattern = sin(coord.x + coord.y);
          
          // Map to volcanic gold and mineral blues
          var dark_color = mix(
            vec3<f32>(0.039, 0.035, 0.031), // Deep Volcanic Obsidian
            vec3<f32>(0.08, 0.14, 0.18),    // Geothermal Mineral Blue
            clamp(pattern * 0.5 + 0.5, 0.0, 1.0)
          );
          
          // Add a warm gold accent glow matching time and coordinate
          let gold_accent = vec3<f32>(0.83, 0.68, 0.21) * 0.18 * max(0.0, sin(p.x * 1.5 + time) * cos(p.y * 2.0 - time));
          dark_color += gold_accent;
          
          // Light Mode Colors (Soft sand/clay and shallow pool water)
          var light_color = mix(
            vec3<f32>(0.96, 0.95, 0.925),   // Soft Sand
            vec3<f32>(0.85, 0.90, 0.92),    // Shallow Mineral Blue
            clamp(pattern * 0.4 + 0.6, 0.0, 1.0)
          );
          let light_gold_accent = vec3<f32>(0.63, 0.45, 0.17) * 0.06 * max(0.0, sin(p.x * 1.5 - time));
          light_color += light_gold_accent;
          
          var final_color = mix(dark_color, light_color, uniforms.is_light_mode);
          return vec4<f32>(final_color, 1.0);
        }
      `;

      const shaderModule = device.createShaderModule({ code: wgslCode });

      // Uniform buffer setup
      const uniformBufferSize = 6 * 4; // 6 floats
      const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' }
        }]
      });

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
          binding: 0,
          resource: { buffer: uniformBuffer }
        }]
      });

      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
      });

      const pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main'
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [{ format: format }]
        },
        primitive: {
          topology: 'triangle-strip',
          stripIndexFormat: undefined
        }
      });

      // Data array representation
      const uniformData = new Float32Array(6);

      function renderFrame(now) {
        if (!isVisible || isScrolling) {
          requestAnimationFrame(renderFrame);
          return;
        }

        // Interpolate mouse
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Is light mode check
        const isLightMode = document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0;

        uniformData[0] = width;
        uniformData[1] = height;
        uniformData[2] = mouse.x;
        uniformData[3] = mouse.y;
        uniformData[4] = now * 0.001; // seconds
        uniformData[5] = isLightMode;

        device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor = {
          colorAttachments: [{
            view: textureView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store'
          }]
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(4, 1, 0, 0);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(renderFrame);
      }

      requestAnimationFrame(renderFrame);
      console.log('WebGPU Background Shader Initialized');

    } catch (e) {
      console.warn('WebGPU failed, falling back to WebGL:', e);
      initWebGLFallback(canvasElement);
    }
  }

  /* --- WebGL Fallback Renderer --- */
  let gl;
  function initWebGLFallback(canvasElement) {
    gl = canvasElement.getContext('webgl') || canvasElement.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, using simple CSS fallback');
      canvasElement.style.display = 'none';
      return;
    }

    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uTime;
      uniform float uIsLightMode;

      void main() {
        float time = uTime * 0.15;
        vec2 p = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
        
        vec2 coord = p;
        for (int i = 1; i < 5; i++) {
          float f = float(i);
          coord.x += 0.3 / f * sin(f * coord.y + time + uMouse.x * 0.002) + 0.5;
          coord.y += 0.3 / f * cos(f * coord.x + time + uMouse.y * 0.002) - 0.5;
        }
        
        float pattern = sin(coord.x + coord.y);
        
        // Dark Mode
        vec3 dark_color = mix(
          vec3(0.039, 0.035, 0.031),
          vec3(0.08, 0.14, 0.18),
          clamp(pattern * 0.5 + 0.5, 0.0, 1.0)
        );
        vec3 gold_accent = vec3(0.83, 0.68, 0.21) * 0.18 * max(0.0, sin(p.x * 1.5 + time) * cos(p.y * 2.0 - time));
        dark_color += gold_accent;
        
        // Light Mode
        vec3 light_color = mix(
          vec3(0.96, 0.95, 0.925),
          vec3(0.85, 0.90, 0.92),
          clamp(pattern * 0.4 + 0.6, 0.0, 1.0)
        );
        vec3 light_gold_accent = vec3(0.63, 0.45, 0.17) * 0.06 * max(0.0, sin(p.x * 1.5 - time));
        light_color += light_gold_accent;
        
        vec3 final_color = mix(dark_color, light_color, uIsLightMode);
        gl_FragColor = vec4(final_color, 1.0);
      }
    `;

    function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const mouseLocation = gl.getUniformLocation(program, 'uMouse');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const isLightModeLocation = gl.getUniformLocation(program, 'uIsLightMode');

    gl.useProgram(program);

    function renderWebGL(now) {
      if (!isVisible || isScrolling) {
        requestAnimationFrame(renderWebGL);
        return;
      }

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0;

      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(timeLocation, now * 0.001);
      gl.uniform1f(isLightModeLocation, isLightMode);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(renderWebGL);
    }

    gl.viewport(0, 0, width, height);
    requestAnimationFrame(renderWebGL);
    console.log('WebGL Fallback Shader Initialized');
  }
}

/* ==========================================
   6. GSAP PREMIUM SCROLL-TRIGGERED ANIMATIONS
   ========================================== */
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger plugin if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero content animation
  gsap.from('.hero-content-wrap', {
    opacity: 0,
    y: 50,
    duration: 1.4,
    ease: 'power4.out',
    delay: 0.1
  });

  // Animated elements on scroll
  const animateOnScroll = (elements, yOffset = 40, duration = 1.0) => {
    gsap.utils.toArray(elements).forEach(el => {
      // Basic check to ensure the element exists
      if (!el) return;

      const animationParams = {
        opacity: 0,
        y: yOffset,
        duration: duration,
        ease: 'power3.out'
      };

      // If ScrollTrigger is loaded, attach it, otherwise run on load
      if (typeof ScrollTrigger !== 'undefined') {
        animationParams.scrollTrigger = {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        };
      }

      gsap.from(el, animationParams);
    });
  };

  // Animate sections and cards on scroll
  animateOnScroll('.grid-2 > div:not(.split-image-panel), .grid-3 > div:not(.split-image-panel), .grid-4 > div:not(.split-image-panel)', 35, 0.9);
  animateOnScroll('.step-row', 50, 1.0);
  animateOnScroll('.split-image-panel', 45, 1.1);
  animateOnScroll('.award-card', 30, 0.9);
  animateOnScroll('section h2, section .accent-title', 25, 0.8);

  // Places split-screen scroll transitions
  if (typeof ScrollTrigger !== 'undefined') {
    const blocks = document.querySelectorAll('.place-content-block');
    const figures = document.querySelectorAll('.place-fig');
    
    blocks.forEach(block => {
      const index = block.getAttribute('data-index');
      ScrollTrigger.create({
        trigger: block,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => activatePlace(index),
        onEnterBack: () => activatePlace(index)
      });
    });

    function activatePlace(index) {
      figures.forEach(fig => {
        if (fig.getAttribute('data-index') === index) {
          fig.classList.add('active');
        } else {
          fig.classList.remove('active');
        }
      });
    }

    // Custom Split-Word Reveal animation helper
    function splitTextIntoSpans(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = '';
        words.forEach(word => {
          const wordWrapper = document.createElement('span');
          wordWrapper.style.display = 'inline-block';
          wordWrapper.style.overflow = 'hidden';
          wordWrapper.style.verticalAlign = 'bottom';
          
          const wordInner = document.createElement('span');
          wordInner.className = 'split-word-inner';
          wordInner.style.display = 'inline-block';
          wordInner.textContent = word + ' ';
          
          wordWrapper.appendChild(wordInner);
          el.appendChild(wordWrapper);
        });
      });
    }

    // Apply Split-Word Reveal to places headings
    splitTextIntoSpans('.split-reveal-text');
    blocks.forEach(block => {
      gsap.fromTo(block.querySelectorAll('.split-word-inner'), 
        { yPercent: 100 },
        {
          yPercent: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 75%'
          }
        }
      );
    });
  }

  // Parallax scroll effects for hero and stats background images
  if (typeof ScrollTrigger !== 'undefined') {
    const heroBg = document.querySelector('.hero-bg-image');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-home',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    const statsBg = document.querySelector('.stats-bg-image');
    if (statsBg) {
      gsap.fromTo(statsBg, 
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }
  }
}
