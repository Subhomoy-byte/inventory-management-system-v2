/// <reference types="vite/client" />

declare module 'three128' {
  export * from 'three';
}

declare module '@designcodeio/threeui' {
  export * from './shaders/warp-field/WarpFieldBackground';
}

declare module '@designcodeio/threeui/style.css' {
  const content: string;
  export default content;
}
