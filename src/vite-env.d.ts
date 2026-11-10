/// <reference types="vite/client" />

// =====================================================
// VUE SINGLE FILE COMPONENT DECLARATIONS
// =====================================================

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;

  export default component;
}