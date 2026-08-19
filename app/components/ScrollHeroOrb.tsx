"use client";

import { useEffect, useRef } from "react";

const RADIANS_PER_PIXEL = 0.0045;
const MAX_RENDER_SIZE = 1200;

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 v_uv;
  uniform sampler2D u_surface;
  uniform float u_rotation;

  const float PI = 3.141592653589793;

  void main() {
    vec2 point = v_uv * 2.0 - 1.0;
    point.y *= -1.0;
    float radiusSquared = dot(point, point);

    if (radiusSquared > 1.0) {
      discard;
    }

    vec3 normal = normalize(vec3(point, sqrt(1.0 - radiusSquared)));
    float cosine = cos(u_rotation);
    float sine = sin(u_rotation);
    vec3 objectNormal = vec3(
      normal.x,
      normal.y * cosine + normal.z * sine,
      -normal.y * sine + normal.z * cosine
    );

    float longitude = atan(objectNormal.x, objectNormal.z);
    float latitude = asin(clamp(objectNormal.y, -1.0, 1.0));
    vec2 textureUv = vec2(
      fract(longitude / (2.0 * PI) + 0.25),
      clamp(0.5 - latitude / PI, 0.001, 0.999)
    );
    vec3 albedo = texture2D(u_surface, textureUv).rgb;
    albedo = clamp((albedo - 0.5) * 1.2 + 0.5, 0.0, 1.0);
    albedo *= vec3(1.08, 0.7, 0.54);

    vec3 lightDirection = normalize(vec3(-0.48, 0.62, 0.82));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float edge = pow(1.0 - normal.z, 2.15);
    float specular = pow(
      max(dot(reflect(-lightDirection, normal), vec3(0.0, 0.0, 1.0)), 0.0),
      34.0
    );

    vec3 color = albedo * (0.36 + diffuse * 0.74);
    color += vec3(1.0, 0.48, 0.24) * specular * 0.11;
    color *= 1.0 - edge * 0.38;
    color = mix(color, vec3(0.2, 0.025, 0.018), edge * 0.2);

    float alpha = 1.0 - smoothstep(0.985, 1.0, radiusSquared);
    gl_FragColor = vec4(color, alpha);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function ScrollHeroOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      return;
    }

    const vertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      VERTEX_SHADER,
    );
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER,
    );

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    const surfaceLocation = gl.getUniformLocation(program, "u_surface");
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();

    if (
      positionLocation < 0 ||
      !rotationLocation ||
      !surfaceLocation ||
      !buffer ||
      !texture
    ) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(surfaceLocation, 0);
    gl.clearColor(0, 0, 0, 0);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const planetTexture = new Image();
    let animationFrame = 0;
    let textureReady = false;

    const renderPlanet = () => {
      if (!textureReady) {
        animationFrame = 0;
        return;
      }

      const angle = reducedMotion.matches
        ? 0
        : window.scrollY * RADIANS_PER_PIXEL;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(rotationLocation, angle);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      orbRef.current?.setAttribute("data-ready", "true");
      animationFrame = 0;
    };

    const requestRender = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(renderPlanet);
      }
    };

    const resizeCanvas = () => {
      const displaySize = Math.min(
        MAX_RENDER_SIZE,
        Math.max(
          640,
          Math.round(
            canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2),
          ),
        ),
      );

      if (canvas.width !== displaySize || canvas.height !== displaySize) {
        canvas.width = displaySize;
        canvas.height = displaySize;
      }

      requestRender();
    };

    planetTexture.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        planetTexture,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      textureReady = true;
      resizeCanvas();
      renderPlanet();
    };
    planetTexture.src = "/images/hero/planet-surface-map.webp?v=56";

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    window.addEventListener("scroll", requestRender, { passive: true });
    reducedMotion.addEventListener("change", requestRender);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestRender);
      reducedMotion.removeEventListener("change", requestRender);
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="hero-orb" ref={orbRef}>
      {/* The image remains as a fast, accessible fallback until WebGL is ready. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Red orbital form representing worldwide industrial sourcing"
        className="hero-planet-fallback"
        draggable={false}
        height={960}
        src="/images/hero/supply-planet-transparent.webp?v=56"
        width={960}
      />
      <canvas
        aria-hidden="true"
        className="hero-planet-canvas"
        height={640}
        ref={canvasRef}
        width={640}
      />
    </div>
  );
}
