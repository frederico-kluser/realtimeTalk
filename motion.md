# Guia Definitivo: Motion & Motion+ com React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4

> **Versão:** Março 2026 · **Stack:** React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS v4 · Motion v12.23+ · motion-plus v2+
>
> **Referência primária:** [motion.dev/docs](https://motion.dev/docs) — documentação oficial da biblioteca Motion

---

## Sumário

1. [Introdução — O que é Motion e Motion+](#1-introdução)
2. [Setup do Stack](#2-setup-do-stack)
3. [Core API Reference](#3-core-api-reference)
4. [Motion+ Premium Components](#4-motion-premium-components)
5. [Integração com Tailwind CSS v4](#5-integração-com-tailwind-css-v4)
6. [TypeScript Patterns](#6-typescript-patterns)
7. [Performance Optimization](#7-performance-optimization)
8. [Acessibilidade](#8-acessibilidade)
9. [Padrões Avançados e Receitas](#9-padrões-avançados-e-receitas)
10. [Troubleshooting e Gotchas](#10-troubleshooting-e-gotchas)

---

## 1. Introdução

### O que é Motion?

Motion (anteriormente Framer Motion) é a biblioteca de animação mais popular para React, com mais de 30 milhões de downloads mensais no npm. Criada por Matt Perry, a biblioteca oferece uma API declarativa que se integra naturalmente com o modelo de componentes do React, eliminando a necessidade de manipulação imperativa do DOM que outras bibliotecas como GSAP exigem.

A biblioteca opera com um **motor híbrido**: utiliza nativamente a Web Animations API e ScrollTimeline do navegador para animações a 120fps aceleradas por GPU. Quando precisa de capacidades que essas APIs não oferecem — como física de springs, keyframes interruptíveis ou rastreamento de gestos — faz fallback transparente para JavaScript.

**Referência:** [motion.dev/docs/react](https://motion.dev/docs/react)

### Motion+ — O ecossistema premium

Motion+ é uma membership paga (pagamento único, atualizações vitalícias) que desbloqueia:

- **Componentes premium:** Carousel, Ticker, AnimateNumber, splitText, Cursor, ScrambleText, Typewriter, AnimateActivity, AnimateView
- **330+ exemplos** com código-fonte completo
- **100+ tutoriais** passo a passo
- **Motion Studio** — ferramentas de edição visual de animação para VS Code
- **Discord privado** e acesso ao repositório GitHub

**Referência:** [motion.dev/plus](https://motion.dev/plus)

### Bundle sizes aproximados (gzip + minified)

| Pacote | Tamanho | Nota |
|--------|---------|------|
| `motion` (completo via `motion/react`) | ~34kb | Inclui todas as features |
| `motion` (via `LazyMotion` + `m`) | ~4.6kb | Render inicial mínimo |
| `domAnimation` feature set | ~15kb | Animações + gestos básicos |
| `domMax` feature set | ~25kb | Tudo incluindo layout + drag |
| Carousel (motion-plus) | +5.5kb | Sobre o componente motion |
| Ticker (motion-plus) | +2.1kb | Sobre o componente motion |
| AnimateNumber (motion-plus) | +2.5kb | Sobre o componente motion |
| splitText (motion-plus) | +0.7kb | Utilitário JavaScript |

---

## 2. Setup do Stack

### 2.1 Criando o projeto

```bash
npm create vite@latest meu-projeto -- --template react-ts
cd meu-projeto
```

### 2.2 Instalando dependências

```bash
# Core
npm install react@19.0.0 react-dom@19.0.0
npm install -D typescript@~5.8.2 @types/react @types/react-dom

# Vite + Tailwind v4
npm install -D vite@6.2.0 @vitejs/plugin-react
npm install -D tailwindcss@4.1.14 @tailwindcss/vite

# Motion (open-source)
npm install motion@12.23.24

# Motion+ (requer token privado do membership)
npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.11.0&token=SEU_TOKEN_AQUI"

# Ícones
npm install lucide-react
```

### 2.3 Configuração do Vite (`vite.config.ts`)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Tree-shaking otimizado para Motion
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
      },
    },
  },
});
```

### 2.4 Tailwind CSS v4 (`src/index.css`)

No Tailwind v4, a configuração é feita via CSS em vez de `tailwind.config.js`:

```css
@import "tailwindcss";

/* CSS variables customizadas para uso em animações */
@theme {
  --color-primary: #6366f1;
  --color-accent: #f59e0b;
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 2.5 Imports do Motion

```tsx
// Import padrão para React
import { motion, AnimatePresence } from "motion/react";

// Para React Server Components (Next.js, etc.)
import * as motion from "motion/react-client";

// Hooks
import {
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useVelocity,
  useMotionValueEvent,
  useAnimate,
  useReducedMotion,
  useInView,
  useDragControls,
  useAnimationControls,
  useTime,
} from "motion/react";

// Utilitários
import { animate, stagger } from "motion";

// Otimização de bundle
import { LazyMotion, domAnimation, domMax, MotionConfig } from "motion/react";
import * as m from "motion/react-m";

// Motion+ premium
import { Carousel, useCarousel } from "motion-plus/react";
import { Ticker } from "motion-plus/react";
import { AnimateNumber } from "motion-plus/react";
import { Cursor } from "motion-plus/react";
import { ScrambleText } from "motion-plus/react";
import { Typewriter } from "motion-plus/react";
import { splitText } from "motion-plus";
```

---

## 3. Core API Reference

### 3.1 O componente `<motion.*>`

O componente `motion` é a fundação da biblioteca. Prefixe qualquer tag HTML ou SVG com `motion.` para desbloquear as props de animação.

```tsx
import { motion } from "motion/react";

function Hero() {
  return (
    <motion.div
      className="rounded-2xl bg-indigo-500 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Bem-vindo
      </motion.h1>
    </motion.div>
  );
}
```

Os componentes `motion` **não causam re-renders do React**. Os valores animados são atualizados a cada frame diretamente no DOM via o pipeline nativo de animação do navegador.

**Referência:** [motion.dev/docs/react-motion-component](https://motion.dev/docs/react-motion-component)

#### Props principais

| Prop | Tipo | Descrição |
|------|------|-----------|
| `animate` | `TargetAndTransition \| string` | Alvo da animação ao entrar ou quando atualizado |
| `initial` | `Target \| false` | Estado visual inicial. `false` desabilita animação de entrada |
| `exit` | `TargetAndTransition \| string` | Animação de saída (requer `AnimatePresence`) |
| `transition` | `Transition` | Configuração de transição padrão do componente |
| `variants` | `Variants` | Mapa de estados nomeados |
| `style` | `MotionStyle` | Suporta motion values e transforms independentes |
| `layout` | `boolean \| "position" \| "size" \| "preserve-aspect"` | Ativa layout animations |
| `layoutId` | `string` | Para shared layout animations entre componentes |
| `whileHover` | `TargetAndTransition \| string` | Animação durante hover |
| `whileTap` | `TargetAndTransition \| string` | Animação durante press/tap |
| `whileDrag` | `TargetAndTransition \| string` | Animação durante drag |
| `whileInView` | `TargetAndTransition \| string` | Animação quando visível no viewport |
| `whileFocus` | `TargetAndTransition \| string` | Animação quando focado (`:focus-visible`) |
| `onUpdate` | `(latest: ResolvedValues) => void` | Callback a cada frame |

#### Valores animáveis

Motion anima: números (`0`, `100`), strings com números (`"0vh"`, `"10px"`), cores (hex, RGBA, HSLA), strings complexas com múltiplos números/cores (como `box-shadow`), e `display: "none"/"block"`. Valores de `x`, `y`, `width`, `height`, `top`, `left`, `right`, `bottom` podem animar entre tipos diferentes de unidade.

```tsx
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: "calc(100vw - 50%)" }}
/>
```

Também é possível animar `width` e `height` para/de `"auto"`:

```tsx
<motion.div animate={{ height: "auto" }} />
```

#### Transform shortcuts

Motion oferece atalhos para transformações CSS que podem ser animados independentemente sem elementos wrapper:

```tsx
<motion.div
  style={{ x: 100, rotate: 90, originX: 0.5 }}
  animate={{ scale: 1.2, rotateZ: 45 }}
/>
```

Atalhos disponíveis: `x`, `y`, `z`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `scale`, `scaleX`, `scaleY`, `scaleZ`, `skew`, `skewX`, `skewY`, `originX`, `originY`, `originZ`, `perspective`.

#### Keyframes

Anime através de uma série de valores passando um array:

```tsx
<motion.div
  animate={{
    x: [0, 100, 50, 100],
    opacity: [0, 1, 0.5, 1],
  }}
  transition={{
    duration: 2,
    times: [0, 0.3, 0.7, 1], // controla timing de cada keyframe
    ease: "easeInOut",
  }}
/>
```

Use `null` como primeiro valor para começar do valor atual:

```tsx
<motion.div animate={{ x: [null, 100] }} />
```

#### CSS Variables

Motion anima CSS variables e aceita definições de CSS variables como alvos:

```tsx
<motion.div
  animate={{ "--rotate": "360deg" }}
  style={{ transform: "rotate(var(--rotate))" }}
/>
```

---

### 3.2 AnimatePresence

`AnimatePresence` mantém elementos no DOM enquanto executam animações de saída definidas com a prop `exit`.

```tsx
import { AnimatePresence, motion } from "motion/react";

function Modal({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <motion.div
            className="rounded-xl bg-white p-6"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
          >
            Conteúdo do modal
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Referência:** [motion.dev/docs/react-animate-presence](https://motion.dev/docs/react-animate-presence)

#### Modos

| Mode | Comportamento |
|------|--------------|
| `"sync"` (padrão) | Novos e antigos elementos animam simultaneamente |
| `"wait"` | O elemento que sai completa a animação antes de o novo entrar |
| `"popLayout"` | O elemento que sai é removido do layout imediatamente (posicionado em `absolute`) |

```tsx
// Slideshow com transição sequencial
<AnimatePresence mode="wait">
  <motion.img
    key={currentImage.src}
    src={currentImage.src}
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
  />
</AnimatePresence>
```

#### `custom` prop e `usePresenceData`

Para passar dados atualizados para componentes que estão saindo (cujas props não podem mais ser atualizadas):

```tsx
<AnimatePresence custom={direction}>
  <Slide key={slideId} />
</AnimatePresence>

// Dentro do Slide:
function Slide() {
  const direction = usePresenceData();
  return (
    <motion.div exit={{ x: direction === "left" ? -300 : 300 }}>
      ...
    </motion.div>
  );
}
```

#### `propagate`

Por padrão, `AnimatePresence` aninhados não propagam animações de saída. Use `propagate` para permitir:

```tsx
<AnimatePresence>
  {show && (
    <motion.section exit={{ opacity: 0 }}>
      <AnimatePresence propagate>
        {/* Animações de saída dos filhos também serão executadas */}
        {children}
      </AnimatePresence>
    </motion.section>
  )}
</AnimatePresence>
```

> ⚠️ **Gotcha:** Filhos diretos do `AnimatePresence` devem ter um `key` único. Sem isso, a biblioteca não consegue rastrear qual componente entrou ou saiu. Além disso, o componente com `exit` deve ser filho **direto** do `AnimatePresence`.

---

### 3.3 Layout Animations

Layout animations detectam automaticamente mudanças de layout (tamanho, posição, reordenamento) e animam suavemente entre estados usando transforms CSS — que são performáticos porque não disparam layout/paint do navegador.

**Referência:** [motion.dev/docs/react-layout-animations](https://motion.dev/docs/react-layout-animations)

#### A prop `layout`

```tsx
// Anima qualquer mudança de layout (posição + tamanho)
<motion.div layout className="p-4 bg-blue-500" />

// Apenas posição
<motion.div layout="position" />

// Apenas tamanho
<motion.div layout="size" />

// Preserva aspect ratio durante animação
<motion.div layout="preserve-aspect" />
```

**Exemplo prático — Accordion:**

```tsx
function Accordion({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.div layout className="overflow-hidden rounded-lg bg-gray-100">
      <motion.h3 layout className="cursor-pointer p-4 font-semibold">
        Clique para expandir
      </motion.h3>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="px-4 pb-4">Conteúdo expandido aqui...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

#### `layoutId` — Shared Layout Animations

Quando dois componentes `motion` em diferentes partes da árvore compartilham o mesmo `layoutId`, Motion anima automaticamente entre eles quando um é montado e o outro desmontado:

```tsx
function TabBar({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button key={tab.id} className="relative px-4 py-2">
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-full bg-indigo-500"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

#### `LayoutGroup`

Agrupa componentes que devem ser tratados como um único contexto de layout. Útil quando múltiplas instâncias independentes do mesmo componente existem na página:

```tsx
import { LayoutGroup } from "motion/react";

<LayoutGroup id="sidebar">
  <TabBar />
</LayoutGroup>

<LayoutGroup id="main">
  <TabBar />
</LayoutGroup>
```

> 💡 **Tip:** Layout animations usam transforms (translate + scale) internamente, não animam `width`/`height` reais. Isso as torna performáticas mas pode distorcer conteúdo de texto. Use `layout="position"` se o conteúdo textual estiver sendo esticado.

---

### 3.4 Gestures

Motion estende os event listeners do React com reconhecedores de gestos robustos e cross-device para hover, tap, focus, pan e drag.

**Referência:** [motion.dev/docs/react-gestures](https://motion.dev/docs/react-gestures)

#### Hover

Diferente de `onMouseEnter`/`onMouseLeave` do CSS, Motion garante que hover só dispara com eventos reais de mouse (filtrando eventos emulados de toque):

```tsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
  onHoverStart={(event) => console.log("hover início")}
  onHoverEnd={(event) => console.log("hover fim")}
  className="rounded-lg bg-indigo-500 px-6 py-3 text-white"
>
  Hover em mim
</motion.button>
```

Para detecção leve de hover (<1kb), existe a função `hover()` importável de `"motion"`.

#### Tap (press)

Detecta quando o ponteiro pressiona e solta no mesmo componente. É acessível via teclado — Enter dispara `whileTap`:

```tsx
<motion.button
  whileTap={{ scale: 0.95, rotate: 3 }}
  onTap={(event, info) => console.log(info.point)}
  onTapStart={(event) => {}}
  onTapCancel={(event) => {}}
  className="rounded-full bg-amber-500 px-8 py-3"
>
  Pressione
</motion.button>
```

#### Focus

Segue as mesmas regras do `:focus-visible` do CSS (foco via teclado/acessibilidade):

```tsx
<motion.input
  whileFocus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.3)" }}
  className="rounded-lg border-2 border-gray-300 px-4 py-2"
/>
```

#### Drag

```tsx
function DragExample() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div ref={constraintsRef} className="relative h-64 w-full rounded-xl bg-gray-100">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        dragMomentum={true}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        whileDrag={{ scale: 1.1, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
        onDrag={(event, info) => console.log(info.point, info.velocity)}
        onDragEnd={(event, info) => console.log("velocidade final:", info.velocity)}
        className="h-20 w-20 cursor-grab rounded-xl bg-indigo-500 active:cursor-grabbing"
      />
    </motion.div>
  );
}
```

Props de drag:

| Prop | Tipo | Descrição |
|------|------|-----------|
| `drag` | `boolean \| "x" \| "y"` | Habilita drag. `"x"` ou `"y"` restringe ao eixo |
| `dragConstraints` | `{ top, left, right, bottom } \| RefObject` | Limites do arrasto |
| `dragElastic` | `number \| { top, left, right, bottom }` | Elasticidade ao atingir limites (0-1) |
| `dragMomentum` | `boolean` | Animação de inércia ao soltar (padrão: `true`) |
| `dragSnapToOrigin` | `boolean` | Retorna à posição original ao soltar |
| `dragTransition` | `InertiaTransition` | Configuração da inércia |
| `dragDirectionLock` | `boolean` | Trava na primeira direção detectada |
| `dragControls` | `DragControls` | Controle imperativo via `useDragControls()` |
| `dragListener` | `boolean` | Se `false`, drag só via `dragControls` |

#### `useDragControls`

Para iniciar drag de um elemento diferente (ex.: uma handle):

```tsx
import { motion, useDragControls } from "motion/react";

function Scrubber() {
  const controls = useDragControls();

  return (
    <>
      <div
        onPointerDown={(e) => controls.start(e, { snapToCursor: true })}
        className="h-2 w-full cursor-pointer rounded bg-gray-300"
      />
      <motion.div
        drag="x"
        dragControls={controls}
        dragListener={false}
        className="h-6 w-6 rounded-full bg-indigo-500"
      />
    </>
  );
}
```

#### Propagação de gestos

Filhos podem prevenir propagação de gestos para pais:

```tsx
<motion.div whileTap={{ scale: 2 }}>
  <motion.button
    whileTap={{ opacity: 0.8 }}
    propagate={{ tap: false }} // Não propaga tap para o pai
  />
</motion.div>

{/* Alternativa com onPointerDownCapture */}
<motion.div whileTap={{ scale: 2 }}>
  <button onPointerDownCapture={(e) => e.stopPropagation()} />
</motion.div>
```

> ⚠️ **Gotcha:** Para gestos de pan/drag funcionarem com toque, o elemento precisa de `touch-action: none` no CSS para o eixo relevante.

---

### 3.5 Scroll Animations

Existem dois tipos fundamentais de animação com scroll: **scroll-triggered** (acionada ao entrar no viewport) e **scroll-linked** (vinculada à posição do scroll).

**Referência:** [motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations)

#### `whileInView` — Scroll-triggered

```tsx
<motion.section
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px", amount: 0.3 }}
  transition={{ duration: 0.6 }}
  className="py-20"
>
  <h2>Esta seção aparece ao scrollar</h2>
</motion.section>
```

Opções de `viewport`:

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `once` | `boolean` | Se `true`, anima apenas na primeira entrada |
| `margin` | `string` | Margem do viewport (ex.: `"-100px"`, `"0px -20px 0px 100px"`) |
| `amount` | `"some" \| "all" \| number` | Quanto do elemento precisa estar visível |

#### `useScroll` — Scroll-linked

```tsx
import { motion, useScroll, useTransform, useSpring } from "motion/react";

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 origin-left bg-indigo-500"
      style={{ scaleX }}
    />
  );
}
```

`useScroll` retorna quatro motion values: `scrollX`, `scrollY`, `scrollXProgress`, `scrollYProgress`.

**Rastrear um elemento específico:**

```tsx
function ParallaxImage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // "início do target encontra fim do container"
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.img
        src="/hero.jpg"
        alt="Hero"
        style={{ y, opacity }}
        className="w-full object-cover"
      />
    </div>
  );
}
```

Opções do `useScroll`:

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `container` | `RefObject` | Container scrollável (padrão: viewport) |
| `target` | `RefObject` | Elemento a rastrear dentro do container |
| `offset` | `[string, string]` | Define quando o progresso vai de 0 a 1 |
| `axis` | `"x" \| "y"` | Eixo rastreado |
| `trackContentSize` | `boolean` | Rastreia mudanças de tamanho do conteúdo |

Formato do `offset`: Cada string é `"target container"`. Valores possíveis: `start`, `center`, `end`, números (0-1), ou pixels/porcentagens.

**Animações GPU-accelerated com scroll:**

Passando `scrollYProgress` diretamente a `opacity` via `style`, ou via `useTransform` para `opacity`/`filter`/`transform`, Motion cria animações aceleradas por hardware:

```tsx
const { scrollYProgress } = useScroll();
const filter = useTransform(
  scrollYProgress,
  [0, 1],
  ["blur(10px)", "blur(0px)"]
);

return <motion.div style={{ opacity: scrollYProgress, filter }} />;
```

**Detectar direção do scroll:**

```tsx
const { scrollY } = useScroll();
const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");

useMotionValueEvent(scrollY, "change", (current) => {
  const previous = scrollY.getPrevious() ?? 0;
  setScrollDirection(current > previous ? "down" : "up");
});
```

---

### 3.6 Motion Values

Motion values são valores compostos e signal-like que Motion usa para rastrear estado e velocidade de animações. São performáticos porque atualizam o DOM diretamente sem causar re-renders do React.

**Referência:** [motion.dev/docs/react-motion-value](https://motion.dev/docs/react-motion-value)

#### `useMotionValue`

```tsx
import { motion, useMotionValue } from "motion/react";

function DragOpacity() {
  const x = useMotionValue(0);

  return (
    <motion.div
      drag="x"
      style={{ x }}
      className="h-20 w-20 rounded-xl bg-indigo-500"
    />
  );
}
```

Métodos: `get()`, `set(value)`, `jump(value)` (reseta velocidade), `isAnimating()`, `stop()`, `destroy()`.

#### `useTransform`

Transforma a saída de um ou mais motion values em um novo motion value:

```tsx
// Forma 1: Mapeamento de ranges
const x = useMotionValue(0);
const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
const backgroundColor = useTransform(
  x,
  [0, 100],
  ["#f00", "#00f"]
);

// Forma 2: Função de transform
const doubledX = useTransform(() => x.get() * 2);

// Forma 3: Múltiplos inputs
const x = useMotionValue(1);
const y = useMotionValue(1);
const sum = useTransform(() => x.get() + y.get());
```

Opções avançadas:

```tsx
// clamp: false para mapeamento perpétuo
const { scrollY } = useScroll();
const rotate = useTransform(scrollY, [0, 100], [0, 360], { clamp: false });
// A cada 100px de scroll, rotaciona mais 360°

// Easing functions customizadas
import { cubicBezier, circOut } from "motion";
const y = useTransform(x, [0, 1], [0, 2], { ease: circOut });
```

**Referência:** [motion.dev/docs/react-use-transform](https://motion.dev/docs/react-use-transform)

#### `useSpring`

Cria um motion value que anima com spring para seu último valor-alvo:

```tsx
// Spring standalone
const springValue = useSpring(0, { stiffness: 300, damping: 20 });

// Attach a outro motion value
const x = useMotionValue(0);
const smoothX = useSpring(x, { stiffness: 100, damping: 30, restDelta: 0.001 });
```

**Referência:** [motion.dev/docs/react-use-spring](https://motion.dev/docs/react-use-spring)

#### `useVelocity`

Retorna um motion value que rastreia a velocidade de outro:

```tsx
const x = useMotionValue(0);
const xVelocity = useVelocity(x);
const xAcceleration = useVelocity(xVelocity); // cadeia para aceleração!
```

#### `useMotionValueEvent`

Alternativa a `useEffect` para escutar mudanças de motion values dentro de componentes React:

```tsx
const x = useMotionValue(0);

useMotionValueEvent(x, "change", (latest) => {
  console.log("x mudou para:", latest);
});

useMotionValueEvent(x, "animationStart", () => {
  console.log("animação iniciou");
});

useMotionValueEvent(x, "animationComplete", () => {
  console.log("animação completou");
});
```

---

### 3.7 Variants e Orchestration

Variants definem estados nomeados de animação que propagam automaticamente pela árvore de componentes.

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {items.map((item) => (
        <motion.li
          key={item}
          variants={itemVariants}
          className="rounded-lg bg-white p-4 shadow"
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

#### Opções de orchestration (dentro de `transition` da variant)

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `when` | `"beforeChildren" \| "afterChildren"` | Quando animar em relação aos filhos |
| `staggerChildren` | `number` | Delay entre cada filho (segundos) |
| `delayChildren` | `number` | Delay antes de iniciar filhos |
| `staggerDirection` | `1 \| -1` | `1` = normal, `-1` = reverso |

#### `custom` prop para variants dinâmicas

```tsx
const variants = {
  visible: (custom: number) => ({
    opacity: 1,
    transition: { delay: custom * 0.2 },
  }),
};

<motion.ul animate="visible">
  <motion.li custom={0} variants={variants} />
  <motion.li custom={1} variants={variants} />
  <motion.li custom={2} variants={variants} />
</motion.ul>
```

---

### 3.8 Transitions

Transitions controlam como os valores são animados. Motion tem três tipos: `spring`, `tween` e `inertia`.

**Referência:** [motion.dev/docs/react-transitions](https://motion.dev/docs/react-transitions)

#### Spring (padrão para propriedades físicas)

```tsx
// Physics-based (incorpora velocidade de gestos)
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 300,  // rigidez
    damping: 25,     // amortecimento (0 = oscila infinitamente)
    mass: 1,         // massa do objeto
    velocity: 2,     // velocidade inicial
    restSpeed: 0.5,  // velocidade mínima para parar
    restDelta: 0.5,  // distância mínima para parar
  }}
/>

// Duration-based (mais fácil de coordenar com outras animações)
<motion.div
  animate={{ rotateX: 90 }}
  transition={{
    type: "spring",
    visualDuration: 0.5, // a parte principal da animação ocorre nesse tempo
    bounce: 0.25,        // 0 = sem bounce, 1 = muito bouncy
  }}
/>
```

#### Tween (padrão para propriedades visuais como opacity, color)

```tsx
<motion.div
  animate={{ opacity: 1, backgroundColor: "#6366f1" }}
  transition={{
    type: "tween",
    duration: 0.5,
    ease: "easeInOut",       // ou "linear", "easeIn", "easeOut", "circIn", etc.
    // ease: [0.43, 0.13, 0.23, 0.96], // cubic bezier customizado
    delay: 0.2,
    repeat: 3,               // número de repetições (Infinity para loop)
    repeatType: "reverse",   // "loop" | "reverse" | "mirror"
    repeatDelay: 0.5,
  }}
/>
```

#### Inertia (para momentum de drag)

```tsx
<motion.div
  drag
  dragTransition={{
    power: 0.8,            // multiplicador de velocidade
    timeConstant: 700,     // constante de deceleração
    bounceStiffness: 600,  // rigidez do bounce nos limites
    bounceDamping: 10,     // amortecimento do bounce
  }}
/>
```

#### Transições por propriedade

```tsx
<motion.div
  animate={{ x: 0, opacity: 1 }}
  transition={{
    default: { type: "spring" },
    opacity: { ease: "linear", duration: 0.3 },
  }}
/>
```

#### `MotionConfig` — Transição global

```tsx
import { MotionConfig } from "motion/react";

<MotionConfig transition={{ duration: 0.4, ease: "easeInOut" }}>
  <App />
</MotionConfig>
```

---

### 3.9 Sequences e Timeline (`animate()`)

A função `animate()` permite criar sequências imperativas com controle de timing relativo:

```tsx
import { animate, stagger } from "motion";

// Sequência simples
async function runSequence() {
  const sequence: AnimationSequence = [
    ["h1", { opacity: 1, y: 0 }, { duration: 0.5 }],
    ["p", { opacity: 1 }, { duration: 0.3, at: "-0.2" }], // sobrepõe 0.2s
    ["button", { scale: [0.8, 1] }, { at: "+0.1" }],       // 0.1s após anterior
    [".items li", { x: [-50, 0], opacity: 1 }, { delay: stagger(0.1) }],
  ];

  const controls = animate(sequence, {
    defaultTransition: { ease: "easeOut" },
  });

  // Controle de playback
  controls.pause();
  controls.play();
  controls.time = 0.5;  // pular para 0.5s
  controls.speed = 2;   // 2x velocidade
  controls.cancel();
}
```

Parâmetro `at`:

| Valor | Significado |
|-------|-------------|
| (omitido) | Após o item anterior |
| `"+0.5"` | 0.5s depois do fim do anterior |
| `"-0.2"` | 0.2s antes do fim do anterior (sobreposição) |
| `0.5` | Posição absoluta na timeline (0.5s do início) |
| `"<"` | Mesmo início do item anterior |

**Referência:** [motion.dev/docs/animate](https://motion.dev/docs/animate)

#### `useAnimate` — Sequences em React

```tsx
import { useAnimate, stagger } from "motion/react";

function AnimatedComponent() {
  const [scope, animate] = useAnimate();

  async function handleClick() {
    await animate("li", { opacity: 1, x: 0 }, {
      delay: stagger(0.05),
      type: "spring",
      stiffness: 300,
    });
    await animate("h2", { scale: [1, 1.1, 1] }, { duration: 0.3 });
  }

  return (
    <div ref={scope}>
      <h2>Lista</h2>
      <ul>
        <li style={{ opacity: 0, transform: "translateX(-20px)" }}>Item 1</li>
        <li style={{ opacity: 0, transform: "translateX(-20px)" }}>Item 2</li>
      </ul>
      <button onClick={handleClick}>Animar</button>
    </div>
  );
}
```

---

### 3.10 SVG Animations

Motion oferece animação nativa de elementos SVG com APIs simplificadas para line drawing:

```tsx
<motion.svg width="200" height="200" viewBox="0 0 200 200">
  <motion.circle
    cx="100"
    cy="100"
    r="80"
    stroke="#6366f1"
    strokeWidth="4"
    fill="none"
    initial={{ pathLength: 0, pathOffset: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 2, ease: "easeInOut" }}
  />
</motion.svg>
```

Propriedades SVG exclusivas:

| Prop | Descrição |
|------|-----------|
| `pathLength` | Progresso do traço (0 a 1) |
| `pathOffset` | Offset do início do traço |
| `pathSpacing` | Espaçamento para traços pontilhados |

**Exemplo avançado — Checkmark animado:**

```tsx
function AnimatedCheckmark({ isComplete }: { isComplete: boolean }) {
  return (
    <motion.svg width="50" height="50" viewBox="0 0 50 50">
      <motion.path
        d="M14 27l7 7 16-16"
        fill="none"
        stroke="#22c55e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isComplete ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ willChange: "transform" }}
      />
    </motion.svg>
  );
}
```

---

## 4. Motion+ Premium Components

### 4.1 Carousel

Componente performático para carrosséis infinitos com paginação inteligente, acessibilidade nativa e suporte a swipe.

**Referência:** [motion.dev/docs/react-carousel](https://motion.dev/docs/react-carousel)

```tsx
import { Carousel, useCarousel } from "motion-plus/react";

const items = [
  <div className="h-64 w-80 rounded-xl bg-indigo-500 p-6 text-white">Slide 1</div>,
  <div className="h-64 w-80 rounded-xl bg-amber-500 p-6 text-white">Slide 2</div>,
  <div className="h-64 w-80 rounded-xl bg-emerald-500 p-6 text-white">Slide 3</div>,
  <div className="h-64 w-80 rounded-xl bg-rose-500 p-6 text-white">Slide 4</div>,
];

function MyCarousel() {
  return (
    <Carousel
      items={items}
      gap={16}
      align="center"
      overflow={true}
      loop={true}
      sizes="calc(80vw - 32px)"
      padding={{ left: 16, right: 16 }}
    >
      <CarouselControls />
    </Carousel>
  );
}
```

#### Props do Carousel

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `items` | `ReactNode[]` | (obrigatório) | Lista de itens do carrossel |
| `axis` | `"x" \| "y"` | `"x"` | Direção do scroll |
| `gap` | `number` | `0` | Espaço entre itens em pixels |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alinhamento off-axis |
| `overflow` | `boolean` | `false` | Itens se estendem até as bordas do viewport |
| `loop` | `boolean` | `false` | Scroll infinito |
| `sizes` | `string` | `auto` | CSS size para cada item |
| `padding` | `{ left, right, top, bottom }` | `{}` | Padding interno |
| `wheelSwipeThreshold` | `number` | — | Distância de scroll do mouse para acionar swipe |

#### `useCarousel` Hook

Qualquer componente renderizado dentro de `<Carousel>` pode acessar estado e funções de paginação:

```tsx
function CarouselControls() {
  const {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    scrollTo,
    isNextActive,
    isPrevActive,
  } = useCarousel();

  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={prevPage}
        disabled={!isPrevActive}
        className="rounded-full bg-gray-200 p-2 disabled:opacity-30"
      >
        ←
      </button>

      <div className="flex gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === currentPage ? "bg-indigo-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <button
        onClick={nextPage}
        disabled={!isNextActive}
        className="rounded-full bg-gray-200 p-2 disabled:opacity-30"
      >
        →
      </button>
    </div>
  );
}
```

#### Autoplay pattern

```tsx
function AutoplayCarousel() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  return (
    <Carousel items={items} loop>
      <AutoplayController intervalRef={intervalRef} />
    </Carousel>
  );
}

function AutoplayController({
  intervalRef,
}: {
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
}) {
  const { nextPage } = useCarousel();

  useEffect(() => {
    intervalRef.current = setInterval(nextPage, 4000);
    return () => clearInterval(intervalRef.current);
  }, [nextPage, intervalRef]);

  return null;
}
```

> 💡 **Tip:** O Carousel usa o mesmo motor de renderização do Ticker, que minimiza ou elimina a clonagem de itens para scroll infinito suave.

---

### 4.2 Ticker

Cria efeitos de marquee/ticker infinitos, acionados por tempo, drag ou scroll.

**Referência:** [motion.dev/docs/react-ticker](https://motion.dev/docs/react-ticker)

```tsx
import { Ticker } from "motion-plus/react";

const logos = [
  <img src="/logo1.svg" alt="Logo 1" className="h-12 w-auto" />,
  <img src="/logo2.svg" alt="Logo 2" className="h-12 w-auto" />,
  <img src="/logo3.svg" alt="Logo 3" className="h-12 w-auto" />,
  <img src="/logo4.svg" alt="Logo 4" className="h-12 w-auto" />,
];

function LogoTicker() {
  return (
    <Ticker
      items={logos}
      velocity={50}
      gap={48}
      overflow={true}
    />
  );
}
```

#### Props do Ticker

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `items` | `ReactNode[]` | (obrigatório) | Itens do ticker |
| `axis` | `"x" \| "y"` | `"x"` | Direção do scroll |
| `velocity` | `number` | `100` | Velocidade em px/s. Negativo inverte direção. `0` para o ticker |
| `gap` | `number` | `0` | Espaço entre itens |
| `overflow` | `boolean` | `false` | Estende até as bordas do viewport |

#### Pausa no hover

```tsx
function PausableTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Ticker
        items={logos}
        velocity={isPaused ? 0 : 80}
        gap={32}
      />
    </div>
  );
}
```

#### Ticker controlado por scroll (via motion value)

Para tickers acionados por scroll, passe um motion value como `velocity`:

```tsx
import { useScroll, useTransform } from "motion/react";
import { Ticker } from "motion-plus/react";

function ScrollDrivenTicker() {
  const { scrollY } = useScroll();
  const velocity = useTransform(scrollY, [0, 1000], [0, 200]);

  return <Ticker items={items} velocity={velocity} gap={24} />;
}
```

---

### 4.3 AnimateNumber

Cria animações de números com efeito de contagem (ticker de dígitos), suportando formatação locale-aware via `Intl.NumberFormat`.

**Referência:** [motion.dev/docs/react-animate-number](https://motion.dev/docs/react-animate-number)

```tsx
import { AnimateNumber } from "motion-plus/react";
import { useState } from "react";

function PriceCounter() {
  const [price, setPrice] = useState(99.99);

  return (
    <div className="text-4xl font-bold">
      <AnimateNumber
        transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
        locales="pt-BR"
        format={{ style: "currency", currency: "BRL" }}
      >
        {price}
      </AnimateNumber>
      <button onClick={() => setPrice((p) => p + 10)} className="mt-4 text-sm">
        +R$10
      </button>
    </div>
  );
}
```

#### Props do AnimateNumber

| Prop | Tipo | Descrição |
|------|------|-----------|
| `children` | `number` | O número a ser animado |
| `transition` | `Transition` | Opções de transição do Motion |
| `locales` | `string` | Locale para `Intl.NumberFormat` (ex.: `"pt-BR"`) |
| `format` | `Intl.NumberFormatOptions` | Opções de formatação |
| `trend` | `1 \| -1 \| ((old, new) => number)` | Direção de rotação dos dígitos |

A prop `trend` (adicionada na v2.10.0) controla a direção de rotação:
- `trend={1}` — dígitos sempre giram para cima (9 → 0 wraps)
- `trend={-1}` — dígitos sempre giram para baixo (0 → 9 wraps)
- Sem `trend` — auto-detecta com base na mudança de valor

**Exemplos de formatação:**

```tsx
// Porcentagem
<AnimateNumber locales="pt-BR" format={{ style: "percent" }}>
  {0.85}
</AnimateNumber>

// Notação compacta
<AnimateNumber locales="pt-BR" format={{ notation: "compact" }}>
  {1500000}
</AnimateNumber>
// Resultado: "1,5 mi"

// Countdown
function Countdown({ seconds }: { seconds: number }) {
  return (
    <AnimateNumber
      transition={{ type: "spring", visualDuration: 0.4, bounce: 0 }}
    >
      {seconds}
    </AnimateNumber>
  );
}
```

CSS classes disponíveis para estilização: `.animate-number-prefix`, `.animate-number-integer`, `.animate-number-fraction`, `.animate-number-suffix`.

---

### 4.4 splitText

Utilitário JavaScript (+0.7kb) que divide texto em caracteres, palavras e linhas individuais para animações staggered.

**Referência:** [motion.dev/docs/split-text](https://motion.dev/docs/split-text)

```tsx
import { splitText } from "motion-plus";
import { animate, stagger } from "motion";
import { useEffect, useRef } from "react";

function SplitTextReveal() {
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Aguardar fontes carregarem para medição correta de linhas
    document.fonts.ready.then(() => {
      const { chars, words, lines } = splitText(textRef.current!);

      animate(
        chars,
        { opacity: [0, 1], y: [20, 0] },
        { delay: stagger(0.03), type: "spring", stiffness: 200, damping: 20 }
      );
    });
  }, []);

  return (
    <h1 ref={textRef} className="text-5xl font-bold">
      Texto animado caractere por caractere
    </h1>
  );
}
```

#### API do splitText

```ts
const { chars, words, lines } = splitText(element, options);
```

| Retorno | Tipo | Descrição |
|---------|------|-----------|
| `chars` | `HTMLElement[]` | Array de spans, um por caractere |
| `words` | `HTMLElement[]` | Array de spans, um por palavra |
| `lines` | `HTMLElement[]` | Array de spans, um por linha |

Opções:

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `charClass` | `string` | Classe CSS para caracteres (padrão: `"split-char"`) |
| `wordClass` | `string` | Classe CSS para palavras (padrão: `"split-word"`) |
| `lineClass` | `string` | Classe CSS para linhas (padrão: `"split-line"`) |
| `preserveHyphens` | `boolean` | Preserva hifenização CSS (desabilita split de chars) |

Cada componente splitado recebe automaticamente um atributo `data-index` com sua posição na lista respectiva.

**Scroll-triggered text reveal:**

```tsx
function ScrollTextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    document.fonts.ready.then(() => {
      const { words } = splitText(textRef.current!);

      // Iniciar invisível
      words.forEach((word) => {
        word.style.opacity = "0";
        word.style.transform = "translateY(10px)";
      });

      // Animar com scroll
      const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 80%", "end 40%"],
      });

      // ... integrar com IntersectionObserver ou useInView
    });
  }, []);

  return (
    <div ref={containerRef}>
      <p ref={textRef} className="text-xl leading-relaxed">
        Este texto será revelado palavra por palavra conforme você rolar a página.
      </p>
    </div>
  );
}
```

> ⚠️ **Gotcha:** `splitText` não preserva tags HTML internas (links, spans de estilo). Para contornar, divida manualmente os segmentos antes/depois das tags.

> ⚠️ **Gotcha:** Sempre aguarde `document.fonts.ready` antes de chamar `splitText`, pois a medição de linhas depende das fontes estarem carregadas.

**ARIA accessibility:** splitText aplica automaticamente tags ARIA para manter o texto legível para leitores de tela.

---

### 4.5 Cursor

Componente para efeitos de cursor customizado com detecção automática de contexto (links, botões, texto), magnetic snapping e cursor zones.

**Referência:** [motion.dev/docs/cursor](https://motion.dev/docs/cursor)

```tsx
import { Cursor } from "motion-plus/react";

function App() {
  return (
    <>
      <Cursor
        className="custom-cursor"
        style={{ backgroundColor: "#6366f1" }}
      />
      <main>
        <a href="#">Link com cursor que cresce</a>
        <button>Botão detectado automaticamente</button>
        <p>Texto com cursor seletor</p>
      </main>
    </>
  );
}
```

Quando `<Cursor />` é renderizado, ele substitui o cursor padrão do navegador. O cursor detecta automaticamente:
- **Links/botões:** cursor cresce
- **Elementos desabilitados:** estado detectado
- **Texto selecionável:** transforma em cursor de texto que cresce com o tamanho da fonte
- **Press:** cursor encolhe

#### Modos

| Modo | Descrição |
|------|-----------|
| `replace` (padrão) | Substitui o cursor do navegador |
| `follow` | Cursor segue o ponteiro sem substituir |

```tsx
<Cursor mode="follow" />
```

#### Magnetic Cursors

Fazem o cursor "encaixar" em elementos interativos no hover:

```tsx
<Cursor magnetic={{ strength: 0.5, morph: true }} />
```

Com `morph: true`, o cursor anima para o formato do alvo usando layout animations do Motion. Com `morph: false`, o cursor mantém seu formato mas é atraído.

#### `useMagneticPull` Hook

Cria o efeito inverso — o elemento é "puxado" na direção do cursor:

```tsx
import { useMagneticPull } from "motion-plus/react";

function MagneticButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const { x, y } = useMagneticPull(ref);

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      className="rounded-full bg-indigo-500 px-8 py-3 text-white"
    >
      Botão Magnético
    </motion.button>
  );
}
```

#### Cursor Zones

Adapte o cursor baseado em "zonas" da página usando `data-cursor-zone`:

```tsx
<div data-cursor-zone="portfolio">
  <Gallery />
</div>

// Reaja à zona ativa
import { useCursorState } from "motion-plus/react";

function CursorContent() {
  const { zone } = useCursorState();

  if (zone === "portfolio") {
    return <Cursor><span>Ver projeto →</span></Cursor>;
  }
  return <Cursor />;
}
```

#### Customização CSS

```css
/* Estilo base do cursor */
.custom-cursor {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6366f1;
  mix-blend-mode: difference;
}
```

Variantes com Motion:

```tsx
<Cursor
  variants={{
    default: { scale: 1 },
    link: { scale: 2, backgroundColor: "#f59e0b" },
    button: { scale: 1.5, borderRadius: "8px" },
  }}
/>
```

---

### 4.6 ScrambleText

Componente React para efeitos de texto embaralhado com controle de playback e stagger.

**Referência:** [motion.dev/docs/react-scramble-text](https://motion.dev/docs/react-scramble-text)

```tsx
import { ScrambleText } from "motion-plus/react";

function ScrambleExample() {
  return (
    <ScrambleText
      duration={1.5}
      delay={0.2}
    >
      Texto que aparece com efeito scramble
    </ScrambleText>
  );
}
```

#### Props do ScrambleText

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `active` | `boolean` | `true` | Controla se o scramble está ativo |
| `duration` | `number \| StaggerConfig` | `1` | Duração ou stagger do reveal |
| `delay` | `number \| StaggerConfig` | `0` | Delay antes de iniciar |
| `chars` | `string \| string[]` | alfanumérico | Caracteres para scrambling |
| `children` | `string` | — | Texto a ser embaralhado |

#### Hover reveal

```tsx
function HoverScramble() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ScrambleText
      active={isHovered}
      duration={Infinity}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Passe o mouse aqui!
    </ScrambleText>
  );
}
```

#### Stagger patterns

```tsx
import { stagger } from "motion";

// Reveal de caractere por caractere a partir do centro
<ScrambleText
  delay={stagger(0.05, { from: "center" })}
  duration={0.5}
>
  Hello world!
</ScrambleText>

// Scramble ao mesmo tempo, reveal staggered
<ScrambleText
  duration={stagger(0.05, { startDelay: 1 })}
>
  Hello world!
</ScrambleText>

// Caracteres começam scramble um por um, todos revelam após 1s
<ScrambleText
  delay={stagger(0.1)}
  duration={1}
>
  Hello world!
</ScrambleText>
```

#### Caracteres customizados

```tsx
// Efeito binário
<ScrambleText chars="01" duration={1}>
  Dados processados
</ScrambleText>

// Emojis (usar array para caracteres multi-byte)
<ScrambleText chars={["😀", "😃", "😄", "😁"]}>
  Feliz!
</ScrambleText>

// Símbolos
<ScrambleText chars="░▒▓█▀▄■□">
  Carregando...
</ScrambleText>
```

---

### 4.7 Typewriter

Efeito de digitação natural com velocidades variáveis e suporte a mudança reativa de conteúdo.

**Referência:** [motion.dev/docs/react-typewriter](https://motion.dev/docs/react-typewriter)

```tsx
import { Typewriter } from "motion-plus/react";

function TypewriterDemo() {
  return (
    <Typewriter>
      Este texto será digitado caractere por caractere.
    </Typewriter>
  );
}
```

Quando o conteúdo muda, o Typewriter automaticamente "apaga" com backspace e digita o novo valor.

Opções:

| Prop | Tipo | Descrição |
|------|------|-----------|
| `children` | `string` | Texto a ser digitado |
| `variance` | `number` | Variação na velocidade (0 = constante) |
| `active` | `boolean` | Controla playback |

```tsx
// Velocidade constante (sem variação natural)
<Typewriter variance={0}>Hello world!</Typewriter>
```

**ARIA accessibility:** Aplica labels corretas para leitores de tela.

---

## 5. Integração com Tailwind CSS v4

### 5.1 Coexistência de classes e motion props

A regra fundamental: **Tailwind cuida do estilo estático, Motion cuida das animações.** Nunca duplique valores entre `className` e props de animação para o mesmo estado.

```tsx
// ✅ CORRETO: Tailwind para estilo base, Motion para animação
<motion.div
  className="rounded-xl bg-indigo-500 p-6 text-white shadow-lg"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", bounce: 0.2 }}
/>

// ❌ ERRADO: Misturar Tailwind transitions com Motion
<motion.div
  className="transition-transform hover:scale-105" // Conflito!
  whileHover={{ scale: 1.05 }}
/>
```

> ⚠️ **Gotcha:** Nunca use classes Tailwind de transição (`transition-*`, `duration-*`, `ease-*`, `hover:scale-*`) em elementos `motion.*`. Elas entram em conflito com o sistema de animação do Motion.

### 5.2 CSS Variables do Tailwind em animações

No Tailwind v4, cores e valores de design são CSS variables nativamente:

```tsx
<motion.div
  className="rounded-xl bg-indigo-500 p-6"
  animate={{
    backgroundColor: "var(--color-amber-500)",
  }}
  transition={{ duration: 0.3 }}
/>
```

Para usar valores do seu tema customizado:

```css
/* src/index.css */
@theme {
  --color-brand: #6366f1;
  --color-brand-hover: #4f46e5;
  --spacing-card: 1.5rem;
}
```

```tsx
<motion.div
  style={{ padding: "var(--spacing-card)" }}
  animate={{ backgroundColor: "var(--color-brand-hover)" }}
  className="rounded-xl text-white"
/>
```

### 5.3 Padrão de className condicional

Para estados de animação que alteram classes Tailwind:

```tsx
function AnimatedCard({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      layout
      className={`rounded-xl p-6 shadow-lg ${
        isActive ? "bg-indigo-500 text-white" : "bg-white text-gray-900"
      }`}
      animate={{
        scale: isActive ? 1.05 : 1,
      }}
      transition={{ type: "spring", bounce: 0.2 }}
    />
  );
}
```

### 5.4 Responsive com Tailwind + Motion

Use media queries do Tailwind para estilo responsivo e detecção JavaScript para animações responsivas:

```tsx
function ResponsiveAnimation() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <motion.div
      className="rounded-xl bg-white p-4 shadow md:p-8"
      initial={{ opacity: 0, y: isMobile ? 20 : 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isMobile ? 0.3 : 0.6 }}
    />
  );
}

// Hook auxiliar
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
```

---

## 6. TypeScript Patterns

### 6.1 Tipagem de Variants

```tsx
import type { Variants } from "motion/react";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: { opacity: 0, scale: 0.95 },
};

// Variants com custom prop tipado
const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: { delay: custom * 0.1 },
  }),
};
```

### 6.2 Custom Motion Components tipados

```tsx
import { motion, type HTMLMotionProps } from "motion/react";

// Componente motion customizado
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  variant?: "primary" | "secondary";
}

function AnimatedCard({ variant = "primary", className, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      className={`rounded-xl p-6 shadow-lg ${
        variant === "primary" ? "bg-indigo-500 text-white" : "bg-white text-gray-900"
      } ${className ?? ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", bounce: 0.2 }}
      {...props}
    />
  );
}
```

### 6.3 Tipagem de Gesture Events

```tsx
import type { PanInfo } from "motion/react";

function DraggableItem() {
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    console.log("posição:", info.point.x, info.point.y);
    console.log("velocidade:", info.velocity.x, info.velocity.y);
    console.log("offset:", info.offset.x, info.offset.y);
    console.log("delta:", info.delta.x, info.delta.y);
  };

  return <motion.div drag onDragEnd={handleDragEnd} />;
}
```

### 6.4 Tipagem de Motion Values

```tsx
import { useMotionValue, useTransform, type MotionValue } from "motion/react";

// Motion values são genéricos
const x: MotionValue<number> = useMotionValue(0);
const color: MotionValue<string> = useMotionValue("#ff0000");

// Hook customizado tipado
function useParallax(scrollProgress: MotionValue<number>, distance: number): MotionValue<number> {
  return useTransform(scrollProgress, [0, 1], [-distance, distance]);
}
```

### 6.5 Tipos utilitários para configs reutilizáveis

```tsx
import type { Transition, Target, TargetAndTransition } from "motion/react";

// Config de transição reutilizável
const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

const fadeInUp: TargetAndTransition = {
  opacity: 1,
  y: 0,
  transition: springTransition,
};

// Mapa de animações tipado
type AnimationPreset = {
  initial: Target;
  animate: TargetAndTransition;
  exit?: TargetAndTransition;
};

const presets: Record<string, AnimationPreset> = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: fadeInUp,
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: springTransition },
    exit: { opacity: 0, scale: 0.9 },
  },
};
```

---

## 7. Performance Optimization

### 7.1 `willChange` optimization

Sempre adicione `willChange` para propriedades que serão animadas:

```tsx
// 🎯 Performance: Para transforms
<motion.div
  animate={{ x: 100, scale: 1.2 }}
  style={{ willChange: "transform" }}
/>

// 🎯 Performance: Para outras propriedades GPU-accelerated
<motion.div
  animate={{ opacity: 0.5, filter: "blur(10px)" }}
  style={{ willChange: "opacity, filter" }}
/>
```

Propriedades GPU-accelerated (animam sem layout/paint): `transform` (x, y, z, scale, rotate), `opacity`, `filter`, `clipPath`, `backgroundColor` (com compositing).

Propriedades que **disparam layout** (evitar animar): `width`, `height`, `top`, `left`, `margin`, `padding`, `border`. Prefira transforms.

### 7.2 LazyMotion e componente `m`

Reduza o bundle initial de ~34kb para ~4.6kb:

```tsx
import { LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";

// domAnimation: ~15kb - animações + gestos (sem layout/drag)
// domMax: ~25kb - tudo incluindo layout + drag

function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    </LazyMotion>
  );
}
```

Para lazy-loading assíncrono:

```tsx
// features.ts
import { domMax } from "motion/react";
export default domMax;

// App.tsx
const loadFeatures = () => import("./features").then((res) => res.default);

function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      {/* m.div funcionará após features carregarem */}
      <m.div animate={{ scale: 1.5 }} />
    </LazyMotion>
  );
}
```

> ⚠️ **Gotcha:** Com `strict`, usar `<motion.div>` dentro de `<LazyMotion>` lança um erro. Sempre use `<m.div>` para manter os benefícios de code-splitting.

### 7.3 Evitando re-renders

Motion values atualizam o DOM sem re-renders do React:

```tsx
// ❌ RUIM: Re-render a cada frame
const [x, setX] = useState(0);
useEffect(() => {
  // atualiza x 60x por segundo -> 60 re-renders/s
}, []);

// ✅ BOM: Sem re-renders
const x = useMotionValue(0);
// Motion atualiza o DOM diretamente
```

### 7.4 Hot functions

Em funções que rodam a cada frame (`onUpdate`, `useTransform`, callbacks de drag/pan), evite:

```tsx
// ❌ EVITAR em hot functions
onUpdate={(latest) => {
  // Criar objetos novos
  const newStyle = { color: latest.x > 100 ? "red" : "blue" };
  // Acessar DOM
  document.querySelector(".item")?.getBoundingClientRect();
  // Setar state do React
  setPosition(latest.x);
}}

// ✅ PREFERIR
const color = useTransform(x, (v) => (v > 100 ? "#f00" : "#00f"));
```

### 7.5 Análise de bundle (Vite)

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true, gzipSize: true }),
  ],
});
```

### 7.6 Checklist de performance

| Item | Ação |
|------|------|
| Propriedades animadas | Usar `transform` e `opacity` sempre que possível |
| `willChange` | Adicionar para propriedades sendo animadas |
| Re-renders | Usar `useMotionValue` em vez de `useState` para valores animados |
| Bundle size | Usar `LazyMotion` + `m` com `domAnimation` |
| Layout animations | Usar `layout="position"` quando possível (mais leve que `true`) |
| Hot functions | Evitar criação de objetos, acesso ao DOM e setState |
| Imagens em drag | Adicionar `draggable={false}` em `<img>` filhos |
| Scroll animations | Usar `viewport={{ once: true }}` quando a animação não precisa repetir |

---

## 8. Acessibilidade

### 8.1 `useReducedMotion`

```tsx
import { useReducedMotion } from "motion/react";

function AccessibleAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
      }}
    >
      Conteúdo acessível
    </motion.div>
  );
}
```

### 8.2 `MotionConfig` global para reduced motion

```tsx
import { MotionConfig } from "motion/react";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Todas as animações respeitarão prefers-reduced-motion automaticamente */}
      <MainContent />
    </MotionConfig>
  );
}
```

O valor `"user"` faz Motion verificar a preferência do sistema operacional. Com reduced motion ativado, animações spring/tween são substituídas por mudanças instantâneas.

### 8.3 Padrões acessíveis

**Tap/keyboard:** Elementos com `whileTap` são automaticamente focáveis e respondem a Enter.

**Cursor component:** O `<Cursor />` do Motion+ respeita `prefers-reduced-motion` e pode ser desabilitado condicionalmente.

**splitText:** Aplica automaticamente ARIA tags para que o texto dividido permaneça legível para screen readers.

**AnimateNumber:** Usa `aria-live` para anunciar mudanças de valor.

**Focus management:** Use `whileFocus` com base em `:focus-visible` (não `:focus`), garantindo que animações de foco só apareçam para navegação por teclado:

```tsx
<motion.button
  whileFocus={{
    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.5)",
  }}
  className="rounded-lg bg-indigo-500 px-6 py-3 text-white outline-none"
>
  Botão acessível
</motion.button>
```

---

## 9. Padrões Avançados e Receitas

### 9.1 Animation Presets reutilizáveis

```tsx
// src/lib/animation-presets.ts
import type { Variants, Transition } from "motion/react";

export const transitions = {
  spring: { type: "spring", stiffness: 300, damping: 24 } as Transition,
  smooth: { type: "spring", visualDuration: 0.4, bounce: 0 } as Transition,
  bouncy: { type: "spring", visualDuration: 0.5, bounce: 0.35 } as Transition,
  snappy: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 } as Transition,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.spring },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: transitions.smooth },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};
```

### 9.2 Custom hooks para Motion

```tsx
// useScrollFade — fade baseado em scroll
function useScrollFade(ref: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [50, 0, 0, -50]);

  return { opacity, y };
}

// Uso
function FadingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { opacity, y } = useScrollFade(ref);

  return (
    <motion.section ref={ref} style={{ opacity, y }}>
      Conteúdo que fade com scroll
    </motion.section>
  );
}
```

```tsx
// useAnimatedCounter — contador animado com motion value
function useAnimatedCounter(target: number, duration = 2) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, target, { duration });
    return controls.stop;
  }, [target, count, duration]);

  return rounded;
}
```

### 9.3 Coordenação entre componentes

```tsx
import { useAnimationControls } from "motion/react";

function CoordinatedAnimations() {
  const headerControls = useAnimationControls();
  const contentControls = useAnimationControls();
  const footerControls = useAnimationControls();

  async function playSequence() {
    await headerControls.start({ opacity: 1, y: 0 });
    await contentControls.start({ opacity: 1, x: 0 });
    await footerControls.start({ opacity: 1, scale: 1 });
  }

  useEffect(() => {
    playSequence();
  }, []);

  return (
    <>
      <motion.header
        animate={headerControls}
        initial={{ opacity: 0, y: -30 }}
      />
      <motion.main
        animate={contentControls}
        initial={{ opacity: 0, x: -30 }}
      />
      <motion.footer
        animate={footerControls}
        initial={{ opacity: 0, scale: 0.9 }}
      />
    </>
  );
}
```

### 9.4 SSR com React 19

Motion é compatível com SSR. Para evitar flicker de hidratação:

```tsx
// Use initial={false} para componentes que devem aparecer no estado final no SSR
<motion.div
  initial={false} // Não anima na entrada, renderiza direto no estado "animate"
  animate={{ opacity: 1 }}
/>

// Para React Server Components (Next.js App Router):
import * as motion from "motion/react-client";
// Este import marca os componentes como client-side
```

**Hidratação sem flicker:** O componente `motion` lê valores iniciais do DOM durante a hidratação, então o servidor pode renderizar os estilos finais e Motion não tentará animar de um estado "vazio".

### 9.5 `MotionConfig` — configuração global

```tsx
import { MotionConfig } from "motion/react";

<MotionConfig
  transition={{ type: "spring", visualDuration: 0.4, bounce: 0.15 }}
  reducedMotion="user"
>
  <App />
</MotionConfig>
```

> 💡 **Tip:** Transições definidas diretamente no componente sobrescrevem as do `MotionConfig`, mas apenas as propriedades declaradas — não é um merge profundo.

---

## 10. Troubleshooting e Gotchas

### Exit animations não funcionam

As três condições obrigatórias para exit animations:

1. `AnimatePresence` **wraps** o condicional (não dentro dele)
2. O componente `motion` tem um `key` **único**
3. O componente `motion` é filho **direto** de `AnimatePresence`

```tsx
// ❌ ERRADO
<AnimatePresence>
  <div> {/* wrapper não-motion */}
    {show && <motion.div exit={{ opacity: 0 }} />}
  </div>
</AnimatePresence>

// ✅ CORRETO
<AnimatePresence>
  {show && <motion.div key="item" exit={{ opacity: 0 }} />}
</AnimatePresence>
```

### Layout animations distorcem texto

Layout animations usam `scale` internamente, o que pode esticar texto:

```tsx
// ✅ Usar layout="position" para evitar distorção de texto
<motion.div layout="position">
  <p>Este texto não será esticado</p>
</motion.div>
```

### `whileHover` "gruda" em mobile

CSS `:hover` pode ser "sticky" em dispositivos touch. Motion filtra isso automaticamente, mas se usar `onMouseEnter`/`onMouseLeave` nativos, o problema persiste. Prefira sempre `whileHover` e `onHoverStart`/`onHoverEnd` do Motion.

### Drag com imagens mostra ghost

Imagens filhas de elementos draggable mostram o ghost padrão do navegador:

```tsx
<motion.div drag>
  <img draggable={false} src="..." alt="..." />
</motion.div>
```

### `useScroll` não atualiza quando conteúdo muda

Por padrão, `useScroll` não rastreia mudanças de tamanho de conteúdo (para evitar overhead). Ative quando necessário:

```tsx
const { scrollYProgress } = useScroll({ trackContentSize: true });
```

### Motion com SVG filters

Gestos não são reconhecidos em SVG filter components (`<feGaussianBlur>`, etc.) porque não possuem presença física. Use variants em um pai:

```tsx
<motion.svg whileHover="hover">
  <filter id="blur">
    <motion.feGaussianBlur
      stdDeviation={0}
      variants={{ hover: { stdDeviation: 2 } }}
    />
  </filter>
</motion.svg>
```

### Bundle size inesperadamente grande

O Bundlephobia pode mostrar ~50kb+ porque conta todos os exports. Na prática, tree-shaking remove o que você não importa. Use `rollup-plugin-visualizer` para medição real. Para máxima otimização, use `LazyMotion` + `m`.

### `splitText` com web fonts

Sempre aguarde fonts carregarem antes de split:

```tsx
useEffect(() => {
  document.fonts.ready.then(() => {
    const { words } = splitText(ref.current!);
    // agora as medições de linhas estão corretas
  });
}, []);
```

### Conflitos com Tailwind transitions

Tailwind `transition-*` e Motion competem pelo controle de transições. Remova classes de transição do Tailwind de elementos `motion.*`:

```tsx
// ❌ Conflito
<motion.div className="transition-all duration-300" animate={{ scale: 1.1 }} />

// ✅ Sem conflito
<motion.div animate={{ scale: 1.1 }} transition={{ duration: 0.3 }} />
```

### `MotionConfig` transition override parcial

Transições no componente substituem (não fazem merge com) as do `MotionConfig`:

```tsx
<MotionConfig transition={{ duration: 1, ease: "linear" }}>
  {/* Aqui, ease: "easeInOut" é aplicada, mas duration volta ao padrão 0.3
      porque a transição local não herdou duration: 1 do MotionConfig */}
  <motion.div
    animate={{ x: 100 }}
    transition={{ ease: "easeInOut" }} // duration: 0.3 (padrão), não 1
  />
</MotionConfig>
```

---

## Referências Rápidas

### Imports mais comuns

```tsx
// Componentes e hooks core
import { motion, AnimatePresence, MotionConfig, LayoutGroup } from "motion/react";
import { useMotionValue, useTransform, useSpring, useScroll } from "motion/react";
import { useMotionValueEvent, useAnimate, useReducedMotion } from "motion/react";
import { useInView, useDragControls, useAnimationControls } from "motion/react";

// Utilitários
import { animate, stagger } from "motion";

// Otimização
import { LazyMotion, domAnimation, domMax } from "motion/react";
import * as m from "motion/react-m";

// Motion+ premium
import { Carousel, useCarousel } from "motion-plus/react";
import { Ticker } from "motion-plus/react";
import { AnimateNumber } from "motion-plus/react";
import { ScrambleText } from "motion-plus/react";
import { Cursor, useMagneticPull, useCursorState } from "motion-plus/react";
import { Typewriter } from "motion-plus/react";
import { splitText } from "motion-plus";
```

### Links de documentação

| Recurso | URL |
|---------|-----|
| Docs React | [motion.dev/docs/react](https://motion.dev/docs/react) |
| Componente motion | [motion.dev/docs/react-motion-component](https://motion.dev/docs/react-motion-component) |
| AnimatePresence | [motion.dev/docs/react-animate-presence](https://motion.dev/docs/react-animate-presence) |
| Layout Animations | [motion.dev/docs/react-layout-animations](https://motion.dev/docs/react-layout-animations) |
| Gestures | [motion.dev/docs/react-gestures](https://motion.dev/docs/react-gestures) |
| Scroll | [motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations) |
| useScroll | [motion.dev/docs/react-use-scroll](https://motion.dev/docs/react-use-scroll) |
| Motion Values | [motion.dev/docs/react-motion-value](https://motion.dev/docs/react-motion-value) |
| useTransform | [motion.dev/docs/react-use-transform](https://motion.dev/docs/react-use-transform) |
| Transitions | [motion.dev/docs/react-transitions](https://motion.dev/docs/react-transitions) |
| animate() | [motion.dev/docs/animate](https://motion.dev/docs/animate) |
| LazyMotion | [motion.dev/docs/react-lazy-motion](https://motion.dev/docs/react-lazy-motion) |
| Reduce Bundle | [motion.dev/docs/react-reduce-bundle-size](https://motion.dev/docs/react-reduce-bundle-size) |
| Carousel | [motion.dev/docs/react-carousel](https://motion.dev/docs/react-carousel) |
| Ticker | [motion.dev/docs/react-ticker](https://motion.dev/docs/react-ticker) |
| AnimateNumber | [motion.dev/docs/react-animate-number](https://motion.dev/docs/react-animate-number) |
| splitText | [motion.dev/docs/split-text](https://motion.dev/docs/split-text) |
| Cursor | [motion.dev/docs/cursor](https://motion.dev/docs/cursor) |
| ScrambleText | [motion.dev/docs/react-scramble-text](https://motion.dev/docs/react-scramble-text) |
| Typewriter | [motion.dev/docs/react-typewriter](https://motion.dev/docs/react-typewriter) |
| Exemplos | [motion.dev/examples](https://motion.dev/examples) |
| Changelog | [motion.dev/changelog](https://motion.dev/changelog) |
| GitHub | [github.com/motiondivision/motion](https://github.com/motiondivision/motion) |
| Motion+ | [motion.dev/plus](https://motion.dev/plus) |

---

*Guia compilado em março de 2026, baseado na documentação oficial do Motion v12.34+ e motion-plus v2.11+.*