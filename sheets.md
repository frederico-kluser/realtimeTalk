# Univer Sheets: documentação técnica completa para integração, tematização e customização

**Univer é o framework open-source de spreadsheets mais ambicioso da atualidade.** Desenvolvido pela DreamNum sob licença Apache 2.0, o sistema combina uma engine de renderização Canvas2D de alta performance com uma arquitetura de plugins modulares, injeção de dependências via redi e um design system construído sobre Tailwind CSS. Com mais de **12.500 stars no GitHub** e **300.000+ linhas de TypeScript**, o Univer suporta planilhas, documentos e slides em browser, Node.js, Electron e Web Workers — processando dezenas de milhões de células com renderização fluida. Esta documentação cobre desde a instalação inicial até tematização avançada, Facade API completa e otimização de performance.
---

## 1. Arquitetura do Univer e seu ecossistema de plugins

O Univer não é uma biblioteca monolítica — é um **framework full-stack isomórfico** organizado em mais de 100 plugins independentes que se compõem conforme a necessidade do projeto. Cada plugin encapsula uma responsabilidade específica, e o sistema de injeção de dependências garante desacoplamento total entre módulos.

### Plugins, módulos e o ciclo de vida

Todo funcionalidade no Univer é empacotada como um **Plugin**. Plugins são compostos por **módulos** organizados em camadas com dependência unidirecional: **View** (Canvas e React) → **Controllers** (lógica de negócio) → **Commands** (padrão command para mutações) → **Services** (encapsulamento funcional) → **Model** (dados). Essa separação permite que o mesmo core rode sem UI no servidor Node.js.
O ciclo de vida de cada plugin passa por **quatro estágios** sequenciais:
1. **Starting** — Plugin é montado; módulos são registrados no sistema de DI
2. **Ready** — Primeira instância de negócio criada; inicialização principal ocorre aqui
3. **Rendered** — Primeira renderização completa; trabalho que depende de DOM
4. **Steady** — Disparado após delay no Rendered; tarefas não-críticas para otimizar carregamento
```typescript
export abstract class Plugin {
onStarting(): void {}   // Registrar dependências
onReady(): void {}      // Inicialização principal
onRendered(): void {}   // DOM disponível
onSteady(): void {}     // Tarefas adiadas
}
```
Dependências entre plugins são declaradas com o decorator `@DependentOn`:
```typescript
@DependentOn(UniverSheetsPlugin, UniverUIPlugin)
export class UniverSheetsUIPlugin extends Plugin {}
```

### Sistema de injeção de dependências (redi)

O Univer utiliza o **redi** (pronuncia-se "ready"), uma biblioteca de DI leve para TypeScript criada por Wendell Hu. Desde julho de 2024 (PR #2801), o redi foi **incorporado diretamente ao `@univerjs/core`**, eliminando a dependência externa:
```typescript
import type { Dependency } from '@univerjs/core';
import { Inject, Injector } from '@univerjs/core';
```
O redi oferece **injeção por construtor, propriedade e interface**, lazy instantiation com `{ lazy: true }`, hierarquia de injetores (parent-child) com decorators `@Self()` e `@SkipSelf()`, além de `@Optional()` e `@Many()`. Na demo de Sheets, **297 módulos** são gerenciados pelo DI — e cada instância do Univer na mesma página recebe seu próprio injetor isolado.

### Sistema de comandos

Todas as mudanças de estado passam pelo **Command System**, que abstrai e registra toda lógica da aplicação. Existem três tipos:
- **COMMAND** — Carrega lógica de negócio; pode ser assíncrono; gera MUTATIONs e OPERATIONs
- **MUTATION** — Mudanças em dados do snapshot (inserir linhas, modificar células); unidade mínima para resolução de conflitos em edição colaborativa; deve ser síncrono
- **OPERATION** — Mudanças em dados que não vão para o snapshot (posição de scroll, estado do sidebar); síncrono

### Mapa de packages essenciais

| Package | Responsabilidade |
|---|---|
| `@univerjs/core` | SDK core, classe Univer, sistema de plugins, DI (redi), command system, lifecycle |
| `@univerjs/sheets` | Modelo de dados de spreadsheet, operações core (agnostic de ambiente) |
| `@univerjs/sheets-ui` | UI de spreadsheet (browser-only): edição de célula, seleção, toolbars |
| `@univerjs/engine-render` | Engine de renderização Canvas2D: scroll buffering, typesetting, layout |
| `@univerjs/engine-formula` | Engine de fórmulas; roda em Web Workers ou Node.js; **500+ fórmulas** |
| `@univerjs/ui` | Framework de UI geral (menus, sidebars, popovers); baseado em React |
| `@univerjs/design` | Design system: temas, cores, componentes base React |
| `@univerjs/themes` | Definições de temas (defaultTheme, greenTheme) |
| `@univerjs/facade` | Facade API para interação simplificada (deprecated em v0.5+; usar `@univerjs/core/facade`) |
| `@univerjs/rpc` | Comunicação RPC para Web Workers e multi-instâncias |
| `@univerjs/icons` | Ícones SVG React tree-shakable |
| `@univerjs/presets` | Bundles pré-configurados para setup rápido |

### Open-source versus features comerciais (Pro)

O core open-source inclui todas as operações de spreadsheet, fórmulas, formatação numérica, validação de dados, formatação condicional, filtros, ordenação, permissões, hyperlinks, imagens flutuantes, find & replace, comentários, engine Canvas e engine de fórmulas com Web Workers. As **features Pro** (licença comercial) incluem import/export de .xlsx via servidor, **edição colaborativa em tempo real** (OT-based, até 200 editores simultâneos), histórico de edições, impressão, pivot tables, charts, sparklines e integração MCP/AI.
---

## 2. Quick Start: dois caminhos de instalação

O Univer oferece dois métodos de instalação: **Preset Mode** (recomendado para início rápido) e **Plugin Mode** (controle granular). Ambos produzem o mesmo resultado — a diferença está no nível de controle e configuração.

### Método A: Preset Mode com `createUniver`

O método mais rápido. Instale apenas dois packages:
```bash
npm install @univerjs/presets @univerjs/preset-sheets-core
```
Crie o arquivo principal:
```typescript
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import '@univerjs/preset-sheets-core/lib/index.css'
const { univer, univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
  },
  presets: [
UniverSheetsCorePreset({
      container: 'app',   // ID do elemento HTML ou HTMLElement
    }),
  ],
})
// Criar um workbook vazio
univerAPI.createWorkbook({})
```
O `createUniver` retorna `{ univer, univerAPI }` onde `univerAPI` é a instância da Facade API (FUniver) pronta para uso. Presets disponíveis incluem `@univerjs/preset-sheets-core` (core), `@univerjs/preset-sheets-advanced` (features avançadas), `@univerjs/preset-sheets-collaboration` (colaboração) e `@univerjs/preset-sheets-node-core` (Node.js headless).

### Método B: Plugin Mode (controle granular)

Instale todos os packages necessários individualmente:
```bash
npm install @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui \
  @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets \
@univerjs/sheets-formula @univerjs/sheets-formula-ui @univerjs/sheets-numfmt \
  @univerjs/sheets-numfmt-ui @univerjs/sheets-ui @univerjs/ui @univerjs/themes
```
A **ordem de imports CSS é crítica** — `@univerjs/design` deve vir primeiro:
```typescript
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
```
Registre plugins manualmente:
```typescript
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import { defaultTheme } from '@univerjs/themes'
const univer = new Univer({
  locale: LocaleType.EN_US,
  theme: defaultTheme,
})
// Registro sequencial de plugins
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverUIPlugin, { container: 'app' })
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsUIPlugin)
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsUIPlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)
univer.registerPlugin(UniverSheetsFormulaUIPlugin)
univer.registerPlugin(UniverSheetsNumfmtPlugin)
univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
univer.createUnit(UniverInstanceType.UNIVER_SHEET, {})
const univerAPI = FUniver.newAPI(univer)
```
No Plugin Mode, importe também os módulos facade de cada plugin:
```typescript
import '@univerjs/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'
```

### Comparativo dos métodos

| Aspecto | Preset Mode | Plugin Mode |
|---|---|---|
| Facade API | Incluída automaticamente | Requer imports manuais de `/facade` |
| Ordem de plugins | Gerenciada automaticamente | Responsabilidade do desenvolvedor |
| Lazy loading | Apenas no nível do preset | Suporta lazy loading por plugin individual |
| Configuração | Mínima | Total controle sobre cada plugin |
| CSS imports | Um único import por preset | Um import por plugin com UI |
O Plugin Mode permite **lazy loading individual**, ideal para performance:
```typescript
import('@univerjs/watermark').then(({ UniverWatermarkPlugin }) => {
  univer.registerPlugin(UniverWatermarkPlugin, {
    textWatermarkSettings: { content: 'Confidencial', fontSize: 36 },
  })
})
```
---

## 3. Design System construído sobre Tailwind CSS

O design system do Univer é **explicitamente construído sobre Tailwind CSS**, conforme documentado em docs.univer.ai. Essa escolha garante consistência entre a engine de renderização Canvas e a camada de UI React, já que ambos consomem os mesmos design tokens traduzidos para CSS variables.

### Arquitetura de tokens e a ponte com Tailwind

Os design tokens seguem a **convenção de escala de cores do Tailwind CSS** (50, 100, 200... 900), armazenados como objetos JavaScript no package `@univerjs/themes`. Em runtime, esses tokens são convertidos para CSS custom properties que alimentam tanto os componentes React (via classes utilitárias inspiradas no Tailwind) quanto a engine Canvas.
A interface `Theme` define a estrutura base de um tema:
```typescript
import type { Theme } from '@univerjs/themes'
export const meuTema: Theme = {
  white: '#FEFEFE',
  black: '#1C1C1C',
  primary: {
50: '#EFF6FF',    // Mais claro
100: '#DBEAFE',
200: '#BFDBFE',
300: '#93C5FD',
400: '#60A5FA',
500: '#3B82F6',   // Base — cor primária principal
600: '#2563EB',
700: '#1D4ED8',
800: '#1E40AF',
900: '#1E3A8A',   // Mais escuro
  },
// Escalas adicionais: grey, green, red, yellow, etc.
// Cada uma segue o mesmo padrão 50-900
}
```
Essa correspondência com as escalas do Tailwind (`blue-500`, `gray-100`, etc.) não é coincidência. O design system foi projetado para que desenvolvedores familiarizados com Tailwind reconheçam imediatamente a estrutura de tokens. Quando você define `primary.500`, está essencialmente definindo o equivalente ao `primary-500` do Tailwind para todo o ecossistema Univer.

### CSS variables: a camada de customização

O tema JavaScript é transformado em CSS custom properties que podem ser sobrescritas diretamente:
```css
/* Override direto de CSS variables */
:root {
  --primary-color: #1890ff;
  --primary-color-hover: #40a9ff;
}
```
O método recomendado, porém, é passar o objeto tema completo na inicialização:
```typescript
import { greenTheme } from '@univerjs/themes'
const univer = new Univer({
  theme: greenTheme,  // Todas as CSS variables são geradas automaticamente
})
```

### Integração prática com projeto Tailwind existente

Se seu projeto já usa Tailwind CSS, o Univer coexiste naturalmente. Os estilos do Univer ficam encapsulados dentro do container do componente. Para mapear tokens do Univer ao seu `tailwind.config.js`, você pode referenciar as mesmas CSS variables:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
'univer-primary': 'var(--primary-color)',
'univer-bg': 'var(--bg-color)',
      },
    },
  },
}
```
Isso permite usar classes como `bg-univer-primary` ou `text-univer-bg` em componentes ao redor do Univer, mantendo consistência visual.

### Dark mode

O dark mode é ativado via propriedade booleana ou toggled dinamicamente:
```typescript
// Na inicialização
const univer = new Univer({
  theme: defaultTheme,
  darkMode: true,
})
// Toggle dinâmico via Facade API
univerAPI.toggleDarkMode(true)   // Ativa dark mode
univerAPI.toggleDarkMode(false)  // Desativa
```
Quando ativado, o Univer aplica overrides de CSS variables que remapeiam todos os tokens de cor para valores apropriados ao modo escuro. O mesmo objeto tema é utilizado — o sistema inverte e modifica os valores automaticamente. Para persistir a preferência:
```typescript
const savedMode = localStorage.getItem('univer.darkMode')
univerAPI.toggleDarkMode(savedMode === 'dark')
```
---

## 4. Referência de componentes UI do @univerjs/design

O `@univerjs/design` é o package que fornece **todos os componentes React fundamentais** do Univer, além dos estilos base do design system. Esses componentes podem ser usados independentemente do spreadsheet.

### Componentes disponíveis

Com base no código-fonte, release notes e documentação, os componentes exportados incluem:
- **Button** — Botão padrão com variantes (primary, default, text, link)
- **Input** — Campo de texto com suporte a prefixo/sufixo
- **InputNumber** — Input numérico com controles de incremento/decremento
- **Select** — Dropdown de seleção
- **Checkbox** — Caixa de seleção
- **Radio** — Botão de rádio
- **Slider** — Controle deslizante para valores numéricos
- **FormLayout** — Wrapper para layout de formulários
- **Dialog** — Modal com suporte a `mask`, `maskClosable`, `keyboard`
- **Tooltip** — Dica contextual ao hover
- **ColorPicker** — Seletor de cores com suporte HSV, input hex/RGB
- **Confirm** — Diálogo de confirmação
- **Dropdown** — Menu dropdown contextual
- **Segmented** — Controle segmentado (tabs)
- **Fab** — Floating action button com atributo `data-u-comp`
```tsx
import '@univerjs/design/lib/index.css'
import { Button, Input, Tooltip, ColorPicker } from '@univerjs/design'
function MeuComponente() {
return (
    <div>
      <Tooltip title="Salvar planilha">
        <Button onClick={() => console.log('salvo')}>Salvar</Button>
      </Tooltip>
      <Input placeholder="Nome da planilha" />
      <ColorPicker onChange={(cor) => console.log(cor)} />
    </div>
  )
}
```

### Layout do workspace (@univerjs/ui)

O `@univerjs/ui` gerencia a estrutura completa da interface:
```
┌─────────────────────────────────────┐
│           Custom Header             │
├─────────────────────────────────────┤
│            Ribbon Toolbar           │
├───────┬───────────────────┬─────────┤
│ Left  │   Formula Bar     │  Right  │
│ Side  ├───────────────────┤  Side   │
│ bar   │  Canvas (Planilha)│  bar    │
├───────┴───────────────────┴─────────┤
│              Footer                 │
└─────────────────────────────────────┘
```
A configuração do `UniverUIPlugin` permite controlar essa estrutura:
```typescript
univer.registerPlugin(UniverUIPlugin, {
  container: 'app',
  header: true,                    // Exibir header
  toolbar: true,                   // Exibir toolbar
  ribbonType: 'default',           // 'default' | 'classic' | 'simple'
  contextMenu: true,               // Menu de contexto
  menu: {
'sheet.command.set-range-bold': { hidden: true },      // Ocultar bold
'sheet.command.set-range-italic': { disabled: true },   // Desabilitar italic
  },
})
```

### Registrando componentes customizados

Via Facade API (recomendado para usuários finais):
```typescript
// Registrar componente React
univerAPI.registerComponent('MeuPainel', MeuComponenteReact)
// Vue 3 (requer @univerjs/ui-adapter-vue3)
univerAPI.registerComponent('MeuPainelVue', ComponenteVue, { framework: 'vue3' })
// Web Component (requer @univerjs/ui-adapter-web-component)
univerAPI.registerComponent('meu-componente', MeuWebComponent, { framework: 'web-component' })
```
Via `ComponentManager` (para desenvolvedores de plugins):
```typescript
import { ComponentManager } from '@univerjs/ui'
export class MeuController extends Disposable {
constructor(
    @Inject(ComponentManager) private _componentManager: ComponentManager,
  ) {
super()
this.disposeWithMe(this._componentManager.register('MeuIcone', MeuIconeReact))
  }
}
```

### Sidebar e dialogs customizados

```typescript
// Abrir sidebar customizado
univerAPI.registerComponent('PainelLateral', () => <div>Conteúdo lateral</div>)
const sidebar = univerAPI.openSidebar({
  header: { title: 'Meu Painel' },
  children: { label: 'PainelLateral' },
  width: 360,
onClose: () => console.log('fechou'),
})
// Abrir dialog customizado
const dialog = univerAPI.openDialog({
  id: 'dialog-unico',
  draggable: true,
  width: 400,
  title: { title: 'Configurações' },
  children: { label: 'MeuDialogComponent' },
  destroyOnClose: true,
})
```

### Sistema de ícones (@univerjs/icons)

O `@univerjs/icons` fornece ícones SVG como componentes React **tree-shakable** — apenas os ícones utilizados são incluídos no bundle:
```tsx
import { SaveSingle, BoldSingle } from '@univerjs/icons'
// Tamanho via fontSize, cor via currentColor
<SaveSingle style={{ color: '#3526de', fontSize: '24px' }} />
// Ícones multi-coloridos com canais estendidos
<PaintBucket extend={{ colorChannel1: 'red' }} />
```
Para substituir ícones built-in:
```typescript
componentManager.register('BoldSingle', MeuIconeBoldCustomizado)
```
---

## 5. Estilização de spreadsheets: células, formatação e aparência


### Cell styles via Facade API

A FRange oferece métodos encadeáveis para estilização:
```typescript
const sheet = univerAPI.getActiveWorkbook().getActiveSheet()
const range = sheet.getRange('A1:D10')
range
  .setValues([['Produto', 'Preço', 'Qtd', 'Total']])
  .setFontWeight('bold')
  .setFontFamily('Inter')
  .setFontSize(14)
  .setFontColor('#1E293B')
  .setBackground('#F1F5F9')
```
A estrutura `IStyleData` permite controle granular no modelo de dados:
```typescript
const cellData = {
  v: 'Texto formatado',
  s: {
    ff: 'Inter',                        // font-family
    fs: 12,                             // font-size
    it: 1,                              // italic (BooleanNumber)
    bl: 1,                              // bold
    ul: { s: 1 },                       // underline
    st: { s: 0 },                       // strikethrough
    cl: { rgb: '#1E293B' },             // font color
    bg: { rgb: '#F8FAFC' },             // background
    ht: 2,                              // horizontal align (1=left, 2=center, 3=right)
    vt: 2,                              // vertical align
    tr: { a: 45, v: 0 },               // text rotation (ângulo, vertical)
    pd: { t: 4, b: 4, l: 8, r: 8 },    // padding
    bd: {                               // borders
      t: { s: 1, cl: { rgb: '#E2E8F0' } },
      b: { s: 1, cl: { rgb: '#E2E8F0' } },
      l: { s: 1, cl: { rgb: '#E2E8F0' } },
      r: { s: 1, cl: { rgb: '#E2E8F0' } },
    },
  },
}
```

### Formatação numérica

O plugin `@univerjs/sheets-numfmt` (incluído no preset core) suporta o padrão Excel de format codes:
```typescript
const range = sheet.getRange('B2:B100')
// Moeda brasileira
range.setNumberFormat('R$ #.##0,00')
// Porcentagem
sheet.getRange('C2:C100').setNumberFormat('0.00%')
// Data
sheet.getRange('D2:D100').setNumberFormat('DD/MM/YYYY')
// Formatos diferentes por célula
range.setNumberFormats([
  ['#,##0.00'],
  ['0.00%'],
  ['yyyy-MM-DD'],
])
// Localidade
const workbook = univerAPI.getActiveWorkbook()
workbook.setNumfmtLocal('pt_BR')  // Separadores brasileiros
```

### Formatação condicional

Requer o plugin `@univerjs/sheets-conditional-formatting` (ou o preset correspondente):
```typescript
const sheet = univerAPI.getActiveWorkbook().getActiveSheet()
const range = sheet.getRange('A1:T100')
// Regra: destacar células não vazias em vermelho
const regra = sheet.newConditionalFormattingRule()
  .whenCellNotEmpty()
  .setRanges([range.getRange()])
  .setBackground('red')
  .setFontColor('white')
  .setBold(true)
  .build()
sheet.addConditionalFormattingRule(regra)
// Regra: valores entre 0 e 50 em amarelo
const regraNumeros = sheet.newConditionalFormattingRule()
  .whenNumberBetween(0, 50)
  .setRanges([range.getRange()])
  .setBackground('#FEF3C7')
  .build()
sheet.addConditionalFormattingRule(regraNumeros)
```
Métodos de condição disponíveis: `whenCellEmpty()`, `whenCellNotEmpty()`, `whenNumberBetween()`, `whenNumberGreaterThan()`, `whenTextContains()`, `whenTextStartsWith()`, `whenDate()`, `whenFormulaSatisfied()`, entre outros. Formatos especiais incluem `setColorScale()`, `setDataBar()`, `setIconSet()`, `setUniqueValues()` e `setDuplicateValues()`.

### Gridlines e frozen panes

```typescript
const sheet = univerAPI.getActiveWorkbook().getActiveSheet()
// Gridlines
sheet.setHiddenGridlines(true)          // Ocultar gridlines
sheet.setGridLinesColor('#E2E8F0')      // Cor personalizada
console.log(sheet.hasHiddenGridLines()) // false
console.log(sheet.getGridLinesColor())  // '#E2E8F0'
// Congelar linhas e colunas
sheet.setFrozenRows(2)        // Congelar 2 primeiras linhas
sheet.setFrozenColumns(1)     // Congelar primeira coluna
// Verificar estado
sheet.getFrozenRows()         // 2
sheet.getFrozenColumns()      // 1
sheet.getFreeze()             // { xSplit: 1, ySplit: 2, startRow: 2, startColumn: 1 }
// Cancelar freeze
sheet.cancelFreeze()
```

### Range Themes (31 temas de células built-in)

O Univer inclui **31 temas pré-registrados** para estilização de ranges, organizados em três intensidades e dez matizes:
- **Light**: `light-blue`, `light-grey`, `light-red`, `light-orange`, `light-yellow`, `light-green`, `light-azure`, `light-indigo`, `light-purple`, `light-magenta`
- **Middle**: `middle-blue`, `middle-grey`, `middle-red`, etc.
- **Dark**: `dark-blue`, `dark-grey`, `dark-red`, etc.
- **Default**: `default`
```typescript
// Aplicar tema a um range
const range = sheet.getRange('A1:E20')
range.useThemeStyle('light-blue')
// Criar tema customizado
const workbook = univerAPI.getActiveWorkbook()
const meuTema = workbook.createRangeThemeStyle('MeuTemaFinanceiro', {
  headerRowStyle: {
    bg: { rgb: 'rgb(30, 58, 138)' },
    cl: { rgb: '#FFFFFF' },
  },
  firstRowStyle: {
    bg: { rgb: 'rgb(239, 246, 255)' },
  },
  secondRowStyle: {
    bg: { rgb: 'rgb(219, 234, 254)' },
  },
})
workbook.registerRangeTheme(meuTema)
range.useThemeStyle('MeuTemaFinanceiro')
```
---

## 6. Facade API: referência completa para manipulação programática

A Facade API (FUniver) é a interface pública principal do Univer. Desde a v0.5+, `@univerjs/facade` como package separado foi depreciado — agora FUniver vem de `@univerjs/core/facade`, e cada plugin estende a API com seus próprios métodos via mixins.

### Obtendo a instância

```typescript
// Preset mode — univerAPI já vem pronto
const { univerAPI } = createUniver({ /* config */ })
// Plugin mode
import { FUniver } from '@univerjs/core/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
const univerAPI = FUniver.newAPI(univer)
```

### Métodos do FUniver (nível global)

```typescript
// Workbook
univerAPI.createWorkbook(data)          // Criar workbook
univerAPI.getActiveWorkbook()           // FWorkbook ativo
univerAPI.setCurrent(unitId)            // Trocar workbook ativo
univerAPI.disposeUnit(unitId)           // Descartar workbook
// Comandos
univerAPI.executeCommand(commandId, params) // Executar comando
univerAPI.undo()                           // Desfazer (async)
univerAPI.redo()                           // Refazer (async)
univerAPI.copy()                           // Copiar (async)
univerAPI.paste()                          // Colar (async)
// Eventos
univerAPI.onBeforeCommandExecute(callback)  // Antes de qualquer comando
univerAPI.onCommandExecuted(callback)       // Após qualquer comando
univerAPI.addEvent(univerAPI.Event.CellClicked, callback)  // Evento específico
// Utilitários
univerAPI.getFormula()                     // FFormula engine
univerAPI.newDataValidation()              // Builder de validação
univerAPI.registerFunction(nome, fn, desc) // Fórmula customizada
univerAPI.toggleDarkMode(bool)             // Dark mode
univerAPI.getSheetHooks()                  // Hooks de renderização
```

### Manipulação de Workbooks (FWorkbook)

```typescript
const wb = univerAPI.getActiveWorkbook()
wb.getId()                    // Unit ID
wb.save()                     // Snapshot IWorkbookData
wb.getActiveSheet()           // FWorksheet ativa
wb.getSheets()                // Todas as FWorksheet[]
wb.create('NovaAba', 100, 26) // Nova worksheet (nome, linhas, colunas)
wb.insertSheet('Dados')       // Inserir aba
wb.deleteSheet(sheet)         // Remover aba
wb.setActiveSheet(sheet)      // Ativar aba
wb.duplicateSheet(sheet)      // Duplicar aba
wb.setNumfmtLocal('pt_BR')   // Localidade de formatação
```

### Manipulação de Worksheets (FWorksheet)

```typescript
const ws = wb.getActiveSheet()
// Identidade
ws.getSheetId()               // Sub-unit ID
ws.getSheetName()             // Nome da aba
ws.setName('Financeiro')      // Renomear
// Ranges
ws.getRange('A1:D10')         // Por notação A1
ws.getRange(0, 0, 10, 4)     // Por coordenadas (row, col, numRows, numCols)
ws.getDataRange()             // Range com todos os dados
// Linhas e colunas
ws.insertRows(5, 3)           // Inserir 3 linhas na posição 5
ws.deleteRows(10, 2)          // Remover 2 linhas a partir da 10
ws.setRowHeight(0, 40)        // Altura da linha 0: 40px
ws.autoResizeRows(0, 10)      // Auto-ajustar altura das linhas 0-10
ws.hideRow(range)             // Ocultar linhas
ws.moveRows(rangeSpec, dest)  // Mover linhas
// Visualização
ws.zoom(1.5)                  // Zoom 150%
ws.scrollToCell(100, 0)       // Scroll até linha 100
ws.refreshCanvas()            // Forçar re-render
// Merge
ws.getMergedRanges()          // Ranges mesclados
```

### Manipulação de Ranges (FRange)

```typescript
const range = ws.getRange('B2:F50')
// Leitura
range.getValue()              // Valor da célula top-left
range.getValues()             // Array 2D de valores
range.getDisplayValues()      // Valores formatados (como exibidos)
range.getFormula()            // Fórmula da top-left
range.getFormulas()           // Array 2D de fórmulas
range.getCellStyleData()      // IStyleData da top-left
range.getA1Notation()         // 'B2:F50'
// Escrita
range.setValue('Olá')                              // Valor único para todas
range.setValue('=SOMA(A1:A10)')                    // Fórmula
range.setValues([['A', 'B'], ['C', 'D']])         // Array 2D
range.setValueForCell('Apenas top-left')           // Apenas célula principal
// Estilo
range.setFontWeight('bold')
range.setFontSize(14)
range.setFontColor('#1E293B')
range.setBackground('#F1F5F9')
range.setFontFamily('Inter')
range.setFontLine('underline')
range.setNumberFormat('#,##0.00')
// Operações
range.merge()                 // Mesclar células
range.mergeAcross()           // Mesclar horizontalmente
range.breakApart()            // Desfazer merge
range.clear()                 // Limpar tudo
range.clearContent()          // Limpar apenas conteúdo
range.clearFormat()           // Limpar apenas formatação
range.activate()              // Selecionar
range.highlight()             // Destacar visualmente
```

### Sistema de eventos

```typescript
// Eventos de célula
univerAPI.addEvent(univerAPI.Event.CellClicked, (params) => {
  console.log('Célula clicada:', params)
})
// Eventos de edição
univerAPI.addEvent(univerAPI.Event.BeforeSheetEditStart, (params) => {
  console.log('Edição iniciando')
})
univerAPI.addEvent(univerAPI.Event.SheetEditEnded, (params) => {
  console.log('Edição finalizada:', params)
})
// Evento de mudança de valor
univerAPI.addEvent(univerAPI.Event.SheetValueChanged, (params) => {
  console.log('Valores alterados')
})
// Evento de seleção
univerAPI.addEvent(univerAPI.Event.SelectionChanged, (params) => {
  console.log('Seleção mudou:', params)
})
// Interceptar comandos (pode cancelar)
univerAPI.onBeforeCommandExecute((command) => {
if (command.id === 'some.dangerous.command') {
throw new Error('prevent')  // Cancela o comando
  }
})
```

### Fórmulas customizadas

```typescript
univerAPI.registerFunction(
'PRECO_FINAL',
  (preco, imposto, desconto) => {
const p = Number(preco) || 0
const i = Number(imposto) || 0
const d = Number(desconto) || 0
return p * (1 + i) * (1 - d)
  },
'Calcula preço final com imposto e desconto'
)
// Usar na planilha: =PRECO_FINAL(A1, 0.18, 0.1)
```
---

## 7. Integração com React: setup, lifecycle e boas práticas

O Univer é construído internamente sobre **React 18.3.1**. A integração segue o padrão de inicialização em `useEffect` com cleanup no unmount.

### Setup completo com React 18/19

```tsx
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreLocale from '@univerjs/preset-sheets-core/locales/pt-BR'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useEffect, useRef } from 'react'
import '@univerjs/preset-sheets-core/lib/index.css'
export function SpreadsheetEditor() {
const containerRef = useRef<HTMLDivElement>(null)
const apiRef = useRef<ReturnType<typeof createUniver>['univerAPI'] | null>(null)
useEffect(() => {
if (!containerRef.current) return
const { univerAPI } = createUniver({
      locale: LocaleType.PT_BR,
      locales: {
        [LocaleType.PT_BR]: mergeLocales(UniverPresetSheetsCoreLocale),
      },
      presets: [
UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    })
    univerAPI.createWorkbook({
      sheetOrder: ['sheet1'],
      sheets: {
        sheet1: {
          id: 'sheet1',
          name: 'Dados',
          rowCount: 1000,
          columnCount: 26,
        },
      },
    })
    apiRef.current = univerAPI
// CRÍTICO: cleanup ao desmontar
return () => {
      univerAPI.dispose()
      apiRef.current = null
    }
  }, [])
return (
    <div
ref={containerRef}
style={{ width: '100%', height: '100vh' }}
    />
  )
}
```

### Padrão com hook customizado

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
function useUniver(config: UniverConfig) {
const containerRef = useRef<HTMLDivElement>(null)
const [api, setApi] = useState<FUniver | null>(null)
useEffect(() => {
if (!containerRef.current) return
const { univerAPI } = createUniver({
...config,
      presets: [
UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    })
setApi(univerAPI)
return () => {
      univerAPI.dispose()
setApi(null)
    }
  }, [])
return { containerRef, api }
}
// Uso
function App() {
const { containerRef, api } = useUniver({
    locale: LocaleType.PT_BR,
    locales: { /* ... */ },
  })
const handleExport = useCallback(() => {
if (!api) return
const wb = api.getActiveWorkbook()
const snapshot = wb.save()
    console.log(JSON.stringify(snapshot))
  }, [api])
return (
    <div>
      <button onClick={handleExport}>Exportar JSON</button>
      <div ref={containerRef} style={{ height: 'calc(100vh - 48px)' }} />
    </div>
  )
}
```

### Considerações importantes no React

O **container DOM deve existir antes** da chamada a `createUniver` — por isso o padrão `useRef` + `useEffect` é obrigatório. O Univer não exporta hooks React próprios; toda interação é feita via Facade API imperativa. O `dispose()` no cleanup é **essencial** para evitar memory leaks, especialmente em SPAs com navegação entre páginas.

### Compatibilidade com React 16.9+ e 17

O suporte a versões antigas do React requer um shim para `react-dom/client`:
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
'react-dom/client': path.resolve(__dirname, './src/react-dom-client-shim.ts'),
    },
  },
})
// src/react-dom-client-shim.ts
import ReactDOM from 'react-dom'
export function createRoot(container: HTMLElement) {
return {
render: (element: JSX.Element) => {
      ReactDOM.render(element, container)
    },
  }
}
```

### Suporte a Vue 3 e Web Components

Para Vue 3, a inicialização usa `onMounted`/`onBeforeUnmount` com o plugin `@univerjs/ui-adapter-vue3`. Para Web Components, utiliza-se `@univerjs/ui-adapter-web-component`. Ambos permitem registrar componentes nativos do framework via `univerAPI.registerComponent(key, component, { framework: 'vue3' })`.
---

## 8. Tematização avançada: do defaultTheme ao tema totalmente customizado


### Temas oficiais disponíveis

O Univer fornece dois temas prontos exportados de `@univerjs/themes` (ou `@univerjs/presets`):
1. **`defaultTheme`** — Tema padrão com acentos em azul, utilizado quando nenhum tema é especificado
2. **`greenTheme`** — Variante com acentos em verde
```typescript
import { defaultTheme, greenTheme } from '@univerjs/themes'
// ou, no preset mode:
import { defaultTheme, greenTheme } from '@univerjs/presets'
```

### Criando um tema customizado do zero

Defina um objeto que implemente a interface `Theme` com todas as escalas de cor necessárias:
```typescript
// temas/tema-corporativo.ts
import type { Theme } from '@univerjs/themes'
export const temaCorporativo: Theme = {
  white: '#FFFFFF',
  black: '#0F172A',
  primary: {
50: '#FFF7ED',
100: '#FFEDD5',
200: '#FED7AA',
300: '#FDBA74',
400: '#FB923C',
500: '#F97316',    // Laranja corporativo
600: '#EA580C',
700: '#C2410C',
800: '#9A3412',
900: '#7C2D12',
  },
// As escalas adicionais (grey, info, success, warning, danger)
// devem seguir o mesmo padrão 50-900
}
```
Aplique na inicialização:
```typescript
// Preset mode
const { univerAPI } = createUniver({
  theme: temaCorporativo,
  presets: [UniverSheetsCorePreset({ container: 'app' })],
})
// Plugin mode
const univer = new Univer({
  theme: temaCorporativo,
})
```

### Override granular de CSS variables

Para ajustes finos sem criar um tema completo, sobrescreva CSS variables diretamente:
```css
/* estilos/univer-overrides.css */
:root {
  --primary-color: #F97316;
  --primary-color-hover: #FB923C;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-base: 13px;
  --border-radius-base: 6px;
}
```
```typescript
import './estilos/univer-overrides.css'
import { defaultTheme } from '@univerjs/themes'
const univer = new Univer({
  theme: defaultTheme,  // Base, com overrides CSS aplicados por especificidade
})
```

### Combinando tema + dark mode

```typescript
const { univerAPI } = createUniver({
  theme: temaCorporativo,
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
// ...
})
// Responder a mudanças de preferência do sistema
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    univerAPI.toggleDarkMode(e.matches)
  })
```

### Range themes customizados para relatórios

```typescript
const wb = univerAPI.getActiveWorkbook()
const temaRelatorio = wb.createRangeThemeStyle('RelatorioFinanceiro', {
  headerRowStyle: {
    bg: { rgb: '#0F172A' },
    cl: { rgb: '#F8FAFC' },
    bl: 1,  // bold
  },
  firstRowStyle: {
    bg: { rgb: '#F8FAFC' },
  },
  secondRowStyle: {
    bg: { rgb: '#E2E8F0' },
  },
})
wb.registerRangeTheme(temaRelatorio)
const sheet = wb.getActiveSheet()
sheet.getRange('A1:H50').useThemeStyle('RelatorioFinanceiro')
```
---

## 9. Performance e otimização: Canvas, Web Workers e milhões de células


### Engine de renderização Canvas2D

O `@univerjs/engine-render` é o coração visual do Univer. Inspirado em **KonvaJs, FabricJs e BabylonJs**, implementa um **scene graph orientado a objetos** sobre HTML5 Canvas2D. A hierarquia segue o padrão **Engine → Scene → Layer → Object**, onde cada elemento desenhado é abstraído como um `Object`, com agrupamentos via `Group` e `SceneViewer`.
A decisão de usar **Canvas em vez de DOM** elimina o overhead de manipulação DOM com grandes quantidades de células. Apenas as células visíveis na viewport são renderizadas — o equivalente a "virtual scrolling" no Canvas. O texto em células reutiliza completamente a engine de renderização de documentos, o que significa que cada célula suporta todas as capacidades de typesetting do Univer Docs (rich text, múltiplas fontes, alinhamentos complexos).
O sistema de **layers** (inspirado em Konva) permite cache por camada: quando há muitos elementos estáticos, camadas individuais podem ser cacheadas como bitmaps, reduzindo o custo de re-renderização. O **scroll buffering** pré-renderiza conteúdo adjacente à viewport para garantir scrolling suave.

### Web Workers para cálculo de fórmulas

A engine de fórmulas (`@univerjs/engine-formula`) pode rodar em **Web Workers** para não bloquear a UI durante cálculos pesados. A arquitetura cria uma instância Univer separada (leve, sem plugins de UI) dentro do Worker, comunicando-se via RPC (`@univerjs/rpc`):
```typescript
// main.ts — Thread principal
const { univerAPI } = createUniver({
  presets: [
UniverSheetsCorePreset({
      container: 'app',
      workerURL: new Worker(
new URL('./worker.ts', import.meta.url),
        { type: 'module' }
      ),
    }),
  ],
})
```
```typescript
// worker.ts — Web Worker
import { UniverSheetsCoreWorkerPreset } from '@univerjs/preset-sheets-core/worker'
import { createUniver } from '@univerjs/presets'
createUniver({
  presets: [UniverSheetsCoreWorkerPreset()],
})
```
O `DataSyncPrimaryController` na thread principal sincroniza criação de documentos e mutations para o worker, enquanto o `DataSyncReplicaController` no worker retorna resultados de fórmulas. Este mecanismo RPC não se limita a Web Workers — funciona entre **quaisquer duas instâncias Univer**, habilitando cálculos server-side ou multi-processo em Electron.

### Otimizações para grandes volumes

O Univer declara suporte a **dezenas de milhões de células** em planilhas e **mais de 2 milhões de fórmulas** por sheet (server-side). As principais estratégias são:
- **Renderização virtual Canvas**: apenas células visíveis são desenhadas, independente do tamanho total
- **Dependency graph para fórmulas**: recalcula apenas células afetadas, não a planilha inteira
- **Lazy loading de plugins**: carregue apenas o necessário; UI plugins podem ser omitidos no servidor
- **Cache de layers**: camadas estáticas cacheadas como bitmap
- **Execução server-side**: operações pesadas em Node.js via `@univerjs/preset-sheets-node-core`
- **Precisão otimizada**: `decimal.js` para precisão financeira, implementações nativas para funções trigonométricas

### Lazy loading de features

```typescript
// Carregar formatação condicional apenas quando necessário
document.getElementById('btn-cf')?.addEventListener('click', async () => {
const { UniverSheetsConditionalFormattingPlugin } =
await import('@univerjs/sheets-conditional-formatting')
const { UniverSheetsConditionalFormattingUIPlugin } =
await import('@univerjs/sheets-conditional-formatting-ui')
  univer.registerPlugin(UniverSheetsConditionalFormattingPlugin)
  univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin)
})
```
---

## 10. Troubleshooting, compatibilidade e breaking changes recentes


### Navegadores e ambientes suportados

| Ambiente | Versão Mínima |
|---|---|
| Chrome | ≥ 70 |
| Edge | ≥ 70 |
| Firefox | ≥ 63 |
| Safari | ≥ 12.0 |
| Electron | ≥ 5 |
| Node.js | ≥ 18.17.0 |
| npm | ≥ 7 |
| pnpm | ≥ 8 |
O compilado alvo é **Chrome 70**. React e RxJS são **peerDependencies** obrigatórias.

### Breaking changes por versão

**v0.4.0** (final de 2024) marcou a separação de vários plugins em pares core + UI: `@univerjs/sheets-formula` foi dividido em `@univerjs/sheets-formula` + `@univerjs/sheets-formula-ui`, e o mesmo ocorreu com `@univerjs/sheets-data-validation`. O decorator `OnLifecycle` foi removido — toda inicialização de plugin deve usar os métodos de lifecycle (`onReady()`, `onRendered()`).
**v0.6.0** (janeiro 2025) trouxe suporte ao **React 19**, mas pode quebrar projetos usando React 16 ou builds UMD. A Facade API ganhou métodos encadeáveis com mudanças nos tipos de retorno.
**v0.9.0** (meados de 2025) removeu o suporte integrado a **Vue 3 do `@univerjs/ui`**. Agora é necessário instalar `@univerjs/ui-adapter-vue3` separadamente e registrar o `UniverVue3AdapterPlugin`.
**v0.14.0** (final de 2025) moveu `IConfirmService` de `@univerjs/ui` para `@univerjs/core`. Comandos de merge cell migraram de `@univerjs/sheets-ui` para `@univerjs/sheets`. Constantes `COLORS` em `@univerjs/core` passaram a ser case-insensitive.
**v0.15.5** (final 2025/início 2026) moveu o feature de auto-fill de `@univerjs/sheets-ui` para `@univerjs/sheets`, requerendo atualização de imports.
O padrão recorrente é de **separação de concerns** (UI separado de core) e **movimentação de interfaces** entre packages — atualize imports ao fazer upgrade.

### Problemas comuns e soluções

**CSS não carrega / layout quebrado**: A causa mais comum é importar CSS na ordem errada. A regra é: `@univerjs/design` primeiro, depois `@univerjs/ui`, depois todos os outros. No preset mode, um único import resolve.
**peerDependencies não instaladas**: npm 3-6 não instala peerDependencies automaticamente. Use npm ≥ 7 ou pnpm ≥ 8. Com yarn, instale manualmente react, react-dom e rxjs.
**Webpack 4 não resolve packages**: O Webpack 4 não suporta o campo `exports` no package.json. Configure aliases manuais para cada package do Univer.
**Crash ao usar em React Portal/Modal**: Versões mais antigas tinham um bug que causava crash quando o Univer era montado dentro de React Portals. Isso foi corrigido em versões recentes — atualize para a última release.
**Facade API retorna undefined**: Certifique-se de que o lifecycle `Steady` foi atingido antes de chamar métodos que dependem de renderização. Use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ...)` para aguardar.

### Migração de outras bibliotecas

**De Luckysheet para Univer**: O Luckysheet (mesmo desenvolvedor, DreamNum) está **arquivado** e oficialmente recomenda migração para o Univer. Existe a biblioteca `@zwight/luckyexcel` que converte estruturas de dados do Luckysheet para o formato Univer. A documentação oficial inclui um guia de migração dedicado.
**De Handsontable para Univer**: Não existe ferramenta de migração automática. A diferença fundamental é paradigmática — **Handsontable é DOM-based**, Univer é **Canvas-based**. Dados precisam ser serializados do formato Handsontable para `IWorkbookData` do Univer. O Univer oferece engine de fórmulas nativa, enquanto Handsontable usa HyperFormula. A licença do Handsontable custa **$899+/dev/ano**, enquanto o Univer OSS é Apache 2.0.
**De AG Grid para Univer**: São ferramentas fundamentalmente diferentes. AG Grid é um **data grid** (exibir/editar dados tabulares com sorting, filtering, grouping). Univer é um **spreadsheet completo** (fórmulas, formatação, colaboração). Se seu caso de uso é planilha com fórmulas e formatação, Univer é mais adequado. Se é grid de dados para dashboards, AG Grid continua sendo a melhor escolha.

### Packages NPM com suas responsabilidades

| Package | Tipo | Descrição |
|---|---|---|
| `@univerjs/core` | OSS | Core SDK, DI, comandos, lifecycle |
| `@univerjs/sheets` | OSS | Modelo de dados de spreadsheet |
| `@univerjs/sheets-ui` | OSS | UI de spreadsheet (browser) |
| `@univerjs/engine-render` | OSS | Engine Canvas2D |
| `@univerjs/engine-formula` | OSS | Engine de fórmulas (500+) |
| `@univerjs/ui` | OSS | Framework de UI (React) |
| `@univerjs/design` | OSS | Design system + componentes |
| `@univerjs/themes` | OSS | Temas (defaultTheme, greenTheme) |
| `@univerjs/icons` | OSS | Ícones SVG tree-shakable |
| `@univerjs/rpc` | OSS | RPC para Web Workers |
| `@univerjs/presets` | OSS | Bundles de setup rápido |
| `@univerjs/sheets-formula` | OSS | Integração fórmulas + sheets |
| `@univerjs/sheets-numfmt` | OSS | Formatação numérica |
| `@univerjs/sheets-conditional-formatting` | OSS | Formatação condicional |
| `@univerjs/sheets-data-validation` | OSS | Validação de dados |
| `@univerjs/sheets-filter` | OSS | Filtros |
| `@univerjs/sheets-sort` | OSS | Ordenação |
| `@univerjs/sheets-find-replace` | OSS | Localizar e substituir |
| `@univerjs/sheets-hyper-link` | OSS | Hyperlinks |
| `@univerjs/sheets-drawing` | OSS | Imagens flutuantes |
| `@univerjs/sheets-thread-comment` | OSS | Comentários |
| `@univerjs/watermark` | OSS | Marca d'água |
| `@univerjs-pro/exchange-client` | Pro | Import/export .xlsx |
| `@univerjs-pro/collaboration` | Pro | Edição colaborativa real-time |
| `@univerjs-pro/print` | Pro | Impressão |
| `@univerjs-pro/pivot-table` | Pro | Tabelas dinâmicas |
| `@univerjs-pro/charts` | Pro | Gráficos (20+ tipos) |
---

## Conclusão: onde o Univer se posiciona e como extrair o máximo

O Univer ocupa um espaço único no ecossistema: é o **único framework open-source que combina renderização Canvas de alta performance com um design system baseado em Tailwind CSS** e arquitetura de plugins verdadeiramente modular. A decisão arquitetural de usar Canvas em vez de DOM para renderização elimina o gargalo que limita concorrentes como Handsontable a centenas de milhares de linhas.
A integração com Tailwind CSS vai além de usar classes utilitárias — o design system inteiro é construído sobre a mesma filosofia de design tokens escaláveis (50-900), o que facilita a criação de temas corporativos que se integrem visualmente com aplicações Tailwind existentes. A capacidade de alternar dark mode em runtime via `toggleDarkMode()` e de criar range themes customizados com `createRangeThemeStyle()` oferece controle visual granular sem necessidade de CSS hacking.
Para projetos que precisam de spreadsheet funcional com fórmulas, formatação rica e performance em grandes volumes, a abordagem é direta: comece com o preset mode, adicione lazy loading para features não-essenciais, e use Web Workers para fórmulas pesadas. Para customização visual profunda, crie um tema completo implementando a interface `Theme` e combine com overrides CSS para ajustes pontuais. A Facade API cobrirá **100% das operações programáticas** — da manipulação de células à interceptação de comandos — sem necessidade de acessar internals do framework.
O ritmo de desenvolvimento acelerado (releases semanais a quinzenais) significa que breaking changes são frequentes, especialmente em reorganização de packages. Fixe versões no `package.json` e consulte o changelog antes de cada upgrade. O investimento em aprender a arquitetura de plugins e o sistema de DI compensa rapidamente para quem precisa estender o Univer com funcionalidades customizadas.