# Graph Report - Inventory-Management-System  (2026-11-25)

## Corpus Check
- 219 files · ~120,132 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 4, .css 4, .pptx 2)

## Summary
- 4301 nodes · 11163 edges · 136 communities (109 shown, 27 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 1438 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ThreeJS Matrix & Vector Math (C0)
- ThreeJS Matrix & Vector Math (C1)
- Frontend Runtime Module Bundle (C2)
- Frontend Runtime Module Bundle (C3)
- Frontend Runtime Module Bundle (C4)
- Frontend Runtime Module Bundle (C5)
- Frontend Runtime Module Bundle (C6)
- Inventory Domain Business Exceptions
- Frontend Runtime Module Bundle (C8)
- Frontend Runtime Module Bundle (C9)
- Frontend Runtime Module Bundle (C10)
- Warehouse Stock REST Controller
- Frontend Runtime Module Bundle (C12)
- Immer Immutable State Patches (C13)
- RBAC Authorization Permissions Model
- Polymorphic Inventory Product Models
- Frontend Build & Package Config
- Frontend Runtime Module Bundle (C17)
- Frontend Runtime Module Bundle (C18)
- User Security & Role Definitions
- Backend Service: ApiControllerTests
- Inventory Domain Service Engine
- Frontend Runtime Module Bundle (C22)
- Frontend Runtime Module Bundle (C23)
- WAL Persistence & File Storage
- Neuform GatewayFlow Batch Effects
- Backend Service: PurchaseOrder
- Frontend Runtime Module Bundle (C27)
- Frontend Runtime Module Bundle (C28)
- Frontend Runtime Module Bundle (C29)
- Immer Immutable State Patches (C30)
- Frontend Runtime Module Bundle (C31)
- Frontend Runtime Module Bundle (C32)
- Frontend Runtime Module Bundle (C33)
- Frontend Runtime Module Bundle (C34)
- Backend Service: DomainBeanConfig
- Lucide SVG Icon Assets (C36)
- Frontend Runtime Module Bundle (C37)
- Frontend Runtime Module Bundle (C38)
- Frontend Runtime Module Bundle (C39)
- Frontend Runtime Module Bundle (C40)
- Frontend Runtime Module Bundle (C41)
- Frontend Runtime Module Bundle (C42)
- Frontend Runtime Module Bundle (C43)
- Frontend Runtime Module Bundle (C44)
- UI Component: sync
- Inventory Report Export Service
- Backend Service: Batch
- UI Component: index
- Warehouse Spatial Topology Models
- Frontend Runtime Module Bundle (C50)
- UI Component: MotionStack
- WarpField ThreeJS Tunnel Renderer
- Frontend Runtime Module Bundle (C53)
- Frontend Runtime Module Bundle (C54)
- Frontend Runtime Module Bundle (C55)
- Frontend Runtime Module Bundle (C56)
- Frontend Runtime Module Bundle (C57)
- Frontend Runtime Module Bundle (C58)
- Backend Service: Product
- Frontend Runtime Module Bundle (C60)
- Frontend Runtime Module Bundle (C61)
- Backend Service: FileBackedRepository
- Frontend Runtime Module Bundle (C63)
- Frontend Runtime Module Bundle (C64)
- Frontend Runtime Module Bundle (C65)
- Frontend Runtime Module Bundle (C66)
- Frontend Runtime Module Bundle (C67)
- TypeScript Compiler Configuration
- Frontend Runtime Module Bundle (C69)
- Frontend Runtime Module Bundle (C70)
- Frontend Runtime Module Bundle (C71)
- Polymorphic Inventory Product Models
- TypeScript Compiler Configuration
- Frontend Runtime Module Bundle (C74)
- Backend Service: ElectronicProduct
- Frontend Runtime Module Bundle (C76)
- Frontend Runtime Module Bundle (C77)
- Frontend Runtime Module Bundle (C78)
- Frontend Runtime Module Bundle (C79)
- UI Component: datasetMapper
- Frontend Runtime Module Bundle (C81)
- Frontend Runtime Module Bundle (C82)
- Backend Service: FragileProduct
- Backend Service: VelocityReorderStrategy
- Frontend Runtime Module Bundle (C85)
- Frontend Runtime Module Bundle (C86)
- Backend Service: Product
- Frontend Runtime Module Bundle (C88)
- Frontend Runtime Module Bundle (C89)
- Backend Service: AverageCostPricingStrategy
- System Architecture Subsystem 91
- Frontend Runtime Module Bundle (C92)
- Frontend Runtime Module Bundle (C93)
- Frontend Runtime Module Bundle (C94)
- Frontend Runtime Module Bundle (C95)
- Frontend Runtime Module Bundle (C96)
- Frontend Runtime Module Bundle (C97)
- Frontend Runtime Module Bundle (C98)
- Frontend Runtime Module Bundle (C99)
- Frontend Runtime Module Bundle (C100)
- Backend Service: Category
- Neuform GatewayFlow Batch Effects
- Frontend Runtime Module Bundle (C104)
- Frontend Runtime Module Bundle (C105)
- Backend Service: MovementType
- Backend Service: ProductImportDto
- Backend Service: Alert
- Frontend Runtime Module Bundle (C109)
- Frontend Runtime Module Bundle (C110)
- Frontend Runtime Module Bundle (C111)
- System Architecture Subsystem 112
- Frontend Build & Package Config
- UI Component: LandingPage
- Frontend Runtime Module Bundle (C115)
- Frontend Runtime Module Bundle (C116)
- System Architecture Subsystem 117
- Backend Service: SyncStatus
- Neuform GatewayFlow Batch Effects
- System Architecture Subsystem 120
- Backend Service: IwmsApplication
- Frontend Build & Package Config
- Backend Service: SyncConflictException
- UI Component: vite-env.d
- Backend Service: ForbiddenException
- Backend Service: Exportable
- TypeScript Compiler Configuration
- Frontend Runtime Module Bundle (C128)
- Frontend Runtime Module Bundle (C129)
- Frontend Runtime Module Bundle (C131)
- Frontend Runtime Module Bundle (C132)
- System Architecture Subsystem 133
- System Architecture Subsystem 135

## God Nodes (most connected - your core abstractions)
1. `W3()` - 408 edges
2. `W4()` - 408 edges
3. `r()` - 112 edges
4. `r()` - 110 edges
5. `t()` - 90 edges
6. `t()` - 90 edges
7. `InventoryService` - 72 edges
8. `a()` - 68 edges
9. `e()` - 68 edges
10. `a()` - 68 edges

## Surprising Connections (you probably didn't know these)
- `AuthController` --references--> `SessionManager`  [EXTRACTED]
  iwms-web/src/main/java/com/iwms/api/controller/AuthController.java → iwms-core/src/main/java/com/iwms/auth/SessionManager.java
- `CustomAuthFilter` --references--> `SessionManager`  [EXTRACTED]
  iwms-web/src/main/java/com/iwms/api/filter/CustomAuthFilter.java → iwms-core/src/main/java/com/iwms/auth/SessionManager.java
- `AuthController` --references--> `User`  [EXTRACTED]
  iwms-web/src/main/java/com/iwms/api/controller/AuthController.java → iwms-core/src/main/java/com/iwms/model/User.java
- `ProductController` --references--> `Repository`  [EXTRACTED]
  iwms-web/src/main/java/com/iwms/api/controller/ProductController.java → iwms-core/src/main/java/com/iwms/repository/Repository.java
- `ProductController` --references--> `InventoryService`  [EXTRACTED]
  iwms-web/src/main/java/com/iwms/api/controller/ProductController.java → iwms-core/src/main/java/com/iwms/service/InventoryService.java

## Import Cycles
- None detected.

## Communities (136 total, 27 thin omitted)

### Community 0 - "ThreeJS Matrix & Vector Math (C0)"
Cohesion: 0.01
Nodes (244): $0(), $2(), _8(), a7(), a8, AE, ai(), aj (+236 more)

### Community 1 - "ThreeJS Matrix & Vector Math (C1)"
Cohesion: 0.01
Nodes (228): $0(), $2(), _8(), a8, A8(), AE, ai(), aj (+220 more)

### Community 2 - "Frontend Runtime Module Bundle (C2)"
Cohesion: 0.03
Nodes (93): _7(), D(), de(), Ie(), m(), ee(), Oe(), P() (+85 more)

### Community 3 - "Frontend Runtime Module Bundle (C3)"
Cohesion: 0.03
Nodes (91): a(), aD(), Ap(), aq(), bA(), Bj(), bN(), c() (+83 more)

### Community 4 - "Frontend Runtime Module Bundle (C4)"
Cohesion: 0.03
Nodes (89): a7(), aq(), b_(), bB(), Bj(), bp(), dC(), Dj() (+81 more)

### Community 5 - "Frontend Runtime Module Bundle (C5)"
Cohesion: 0.05
Nodes (79): J3(), W3(), _5(), b3(), bb(), bf(), bS(), Bu() (+71 more)

### Community 6 - "Frontend Runtime Module Bundle (C6)"
Cohesion: 0.05
Nodes (77): J4(), W4(), _5(), b4(), bb(), bf(), bS(), Bu() (+69 more)

### Community 7 - "Inventory Domain Business Exceptions"
Cohesion: 0.06
Nodes (4): DuplicateSkuException, InsufficientStockException, UnauthorizedException, StockSnapshot

### Community 8 - "Frontend Runtime Module Bundle (C8)"
Cohesion: 0.03
Nodes (67): _7(), D(), de(), Ie(), m(), ee(), Oe(), P() (+59 more)

### Community 9 - "Frontend Runtime Module Bundle (C9)"
Cohesion: 0.04
Nodes (67): $6(), _9(), aY(), Az(), b2(), bp(), Bq(), ch() (+59 more)

### Community 10 - "Frontend Runtime Module Bundle (C10)"
Cohesion: 0.04
Nodes (62): ag(), aU(), b_(), bC(), bg(), a(), c_(), cC() (+54 more)

### Community 11 - "Warehouse Stock REST Controller"
Cohesion: 0.07
Nodes (6): AuditLogger, AuditEvent, BackupController, ProductController, StockController, SyncController

### Community 12 - "Frontend Runtime Module Bundle (C12)"
Cohesion: 0.04
Nodes (66): AX(), bK(), cq(), a(), c(), f(), o(), u() (+58 more)

### Community 13 - "Immer Immutable State Patches (C13)"
Cohesion: 0.04
Nodes (66): a(), aD(), Ap(), applyPatches(), bN(), c(), BZ(), cD() (+58 more)

### Community 14 - "RBAC Authorization Permissions Model"
Cohesion: 0.05
Nodes (25): AdminUser, EmployeeUser, ManagerUser, Permission, CYCLE_COUNT, DELETE_PRODUCTS, GENERATE_FLOOR_REPORT, MANAGE_SYSTEM (+17 more)

### Community 15 - "Polymorphic Inventory Product Models"
Cohesion: 0.07
Nodes (4): BulkProduct, Builder, DataSeeder, ProductHierarchyTest

### Community 16 - "Frontend Build & Package Config"
Cohesion: 0.05
Nodes (56): dependencies, autoprefixer@^10.6.2, clsx@^2.1.1, @fontsource/inter@^5.3.0, @fontsource/jetbrains-mono@^5.3.0, @fontsource/space-grotesk@^5.3.0, framer-motion@^14.10.1, idb@^8.0.4 (+48 more)

### Community 17 - "Frontend Runtime Module Bundle (C17)"
Cohesion: 0.07
Nodes (54): a0(), Ai(), ax(), Ba(), bc(), Bm(), c(), cw() (+46 more)

### Community 18 - "Frontend Runtime Module Bundle (C18)"
Cohesion: 0.07
Nodes (55): a0(), Bh(), bw(), Cu(), cv(), d1(), d4(), Dh() (+47 more)

### Community 19 - "User Security & Role Definitions"
Cohesion: 0.07
Nodes (10): Pbkdf2Authenticator, SessionManager, Session, Role, ADMIN, EMPLOYEE, MANAGER, User (+2 more)

### Community 20 - "Backend Service: ApiControllerTests"
Cohesion: 0.10
Nodes (7): StockMovement, ReportGeneratorTest, StrategyTests, SmokeTest, FilePersistenceTest, ApiControllerTests, ProductImportTest

### Community 21 - "Inventory Domain Service Engine"
Cohesion: 0.09
Nodes (7): Alert, InventoryService, SyncEngine, SyncConflict, SyncOperation, SyncResult, InventoryServiceTest

### Community 22 - "Frontend Runtime Module Bundle (C22)"
Cohesion: 0.07
Nodes (51): a(), ab(), b(), bt(), dx(), Ea(), eb(), Ei() (+43 more)

### Community 23 - "Frontend Runtime Module Bundle (C23)"
Cohesion: 0.05
Nodes (50): A8(), AX(), bK(), cU(), CX, da(), dX(), EI() (+42 more)

### Community 24 - "WAL Persistence & File Storage"
Cohesion: 0.07
Nodes (4): StorageException, AtomicFileWriter, BackupManager, MovementLedger

### Community 25 - "Neuform GatewayFlow Batch Effects"
Cohesion: 0.04
Nodes (26): AmberHalftone, BakeKnobs, ConnectivityGraph, DefenseLines, DIAGNOSTICS_PANEL_DEFAULTS, DIAGNOSTICS_PANEL_VARIANTS, DiagnosticsPanelVariant, EffectDefinition (+18 more)

### Community 26 - "Backend Service: PurchaseOrder"
Cohesion: 0.05
Nodes (9): Auditable, PurchaseOrder, OrderLine, Status, CANCELLED, CREATED, RECEIVED, Storable (+1 more)

### Community 27 - "Frontend Runtime Module Bundle (C27)"
Cohesion: 0.06
Nodes (48): bD(), cE(), _D(), dE(), eE(), Et(), _f(), fE() (+40 more)

### Community 28 - "Frontend Runtime Module Bundle (C28)"
Cohesion: 0.14
Nodes (46): aw(), b1(), bx(), d(), i(), j(), je(), l() (+38 more)

### Community 29 - "Frontend Runtime Module Bundle (C29)"
Cohesion: 0.05
Nodes (45): bR(), by(), CL(), co(), ds(), e7(), eg(), eP() (+37 more)

### Community 30 - "Immer Immutable State Patches (C30)"
Cohesion: 0.06
Nodes (45): applyPatches(), CN(), constructor(), createDraft(), deleteProperty(), DP(), e6(), Ey() (+37 more)

### Community 31 - "Frontend Runtime Module Bundle (C31)"
Cohesion: 0.06
Nodes (38): ag(), aU(), bC(), bg(), a(), c_(), cC(), eU() (+30 more)

### Community 32 - "Frontend Runtime Module Bundle (C32)"
Cohesion: 0.15
Nodes (44): aw(), b1(), bx(), d(), i(), j(), je(), l() (+36 more)

### Community 33 - "Frontend Runtime Module Bundle (C33)"
Cohesion: 0.07
Nodes (42): bD(), cE(), _D(), dE(), eE(), Et(), _f(), fE() (+34 more)

### Community 34 - "Frontend Runtime Module Bundle (C34)"
Cohesion: 0.09
Nodes (42): a(), ab(), bt(), Dc(), Ea(), eb(), Ei(), El() (+34 more)

### Community 35 - "Backend Service: DomainBeanConfig"
Cohesion: 0.09
Nodes (4): Authenticator, Repository, DomainBeanConfig, AuthController

### Community 36 - "Lucide SVG Icon Assets (C36)"
Cohesion: 0.11
Nodes (23): App(), TAB_TITLES, CommandPalette(), CommandPaletteProps, ReloadPrompt(), DockProps, NavTab, MobileNav() (+15 more)

### Community 37 - "Frontend Runtime Module Bundle (C37)"
Cohesion: 0.10
Nodes (35): at(), av(), c3(), Cn(), f3(), fw(), hm(), _i() (+27 more)

### Community 38 - "Frontend Runtime Module Bundle (C38)"
Cohesion: 0.12
Nodes (34): Ai(), Ba(), bc(), Bm(), c(), cw(), e1(), e4() (+26 more)

### Community 39 - "Frontend Runtime Module Bundle (C39)"
Cohesion: 0.08
Nodes (30): A6(), b6(), Cf(), d6(), c(), f(), ed(), f6() (+22 more)

### Community 40 - "Frontend Runtime Module Bundle (C40)"
Cohesion: 0.07
Nodes (35): bR(), by(), CL(), co(), eg(), eP(), FR(), fs() (+27 more)

### Community 41 - "Frontend Runtime Module Bundle (C41)"
Cohesion: 0.11
Nodes (36): a3(), ar(), Bh(), bi(), c3(), cv(), dv(), fc() (+28 more)

### Community 42 - "Frontend Runtime Module Bundle (C42)"
Cohesion: 0.11
Nodes (34): at(), av(), b(), c4(), Cn(), fw(), hm(), _i() (+26 more)

### Community 43 - "Frontend Runtime Module Bundle (C43)"
Cohesion: 0.09
Nodes (27): bI(), Cf(), dI(), c(), f(), ed(), g2(), gI() (+19 more)

### Community 44 - "Frontend Runtime Module Bundle (C44)"
Cohesion: 0.07
Nodes (31): bB(), BL(), bT(), dK(), dN(), ds(), gD(), gT() (+23 more)

### Community 45 - "UI Component: sync"
Cohesion: 0.17
Nodes (19): MainLayout(), StatusChip(), Navbar(), Sidebar(), DatasetUploadModal(), StockMovementModal(), ConflictReviewPanel(), useAuth() (+11 more)

### Community 46 - "Inventory Report Export Service"
Cohesion: 0.12
Nodes (4): CsvReportGenerator, PdfReportGenerator, ReportController, WarehouseController

### Community 47 - "Backend Service: Batch"
Cohesion: 0.08
Nodes (7): Batch, AlertStrategy, ExpiringBatchAlertStrategy, FefoPickStrategy, FifoPickStrategy, LowStockAlertStrategy, PickStrategy

### Community 48 - "UI Component: index"
Cohesion: 0.18
Nodes (18): StockMovementModalProps, DEFAULT_SHELF_BINS, InteractiveShelf3DProps, ShelfBinData, CycleCountPageProps, InventoryPageProps, ReportsPageProps, WarehouseMapPageProps (+10 more)

### Community 49 - "Warehouse Spatial Topology Models"
Cohesion: 0.08
Nodes (3): Bin, Warehouse, Zone

### Community 50 - "Frontend Runtime Module Bundle (C50)"
Cohesion: 0.16
Nodes (30): _1(), a1(), Am(), Au(), c1(), dm(), Ex(), gc() (+22 more)

### Community 51 - "UI Component: MotionStack"
Cohesion: 0.12
Nodes (18): GlassCard(), GlassCardProps, CardItem, STACK_CARDS, StatusChipProps, VectorGraphic(), VectorGraphicProps, WarpTransitionOverlay() (+10 more)

### Community 52 - "WarpField ThreeJS Tunnel Renderer"
Cohesion: 0.11
Nodes (26): WarpFieldBackground(), WarpFieldBackgroundProps, BACKGROUND, createGlowTexture(), createGlyphAtlas(), createGlyphGeometries(), createHyperspaceLayer(), createKeycapGeometry() (+18 more)

### Community 53 - "Frontend Runtime Module Bundle (C53)"
Cohesion: 0.09
Nodes (29): A2(), aB(), AN(), b2(), cI(), Cp(), iB(), IN() (+21 more)

### Community 54 - "Frontend Runtime Module Bundle (C54)"
Cohesion: 0.18
Nodes (29): _3(), a3(), Al(), aS(), e3(), eS(), f1(), hb() (+21 more)

### Community 55 - "Frontend Runtime Module Bundle (C55)"
Cohesion: 0.12
Nodes (28): ac(), ax(), b4(), cb(), Ch(), dw(), e0(), Em() (+20 more)

### Community 56 - "Frontend Runtime Module Bundle (C56)"
Cohesion: 0.20
Nodes (26): _4(), a4(), Al(), e4(), eS(), hb(), hf(), Hn() (+18 more)

### Community 57 - "Frontend Runtime Module Bundle (C57)"
Cohesion: 0.14
Nodes (26): ac(), aS(), b3(), cb(), Ch(), Em(), f(), f1() (+18 more)

### Community 58 - "Frontend Runtime Module Bundle (C58)"
Cohesion: 0.14
Nodes (25): bw(), Cu(), d1(), d3(), dS(), Du(), ew(), fS() (+17 more)

### Community 60 - "Frontend Runtime Module Bundle (C60)"
Cohesion: 0.10
Nodes (22): bT(), dK(), gT(), hK(), i2(), iP(), IR(), lP() (+14 more)

### Community 61 - "Frontend Runtime Module Bundle (C61)"
Cohesion: 0.11
Nodes (24): A2(), aB(), AN(), Cp(), iB(), KV(), lB(), oB() (+16 more)

### Community 62 - "Backend Service: FileBackedRepository"
Cohesion: 0.16
Nodes (3): FileBackedRepository, ProductDeserializer, InMemoryRepository

### Community 63 - "Frontend Runtime Module Bundle (C63)"
Cohesion: 0.12
Nodes (23): CN(), deleteProperty(), DP(), eI(), FP(), get(), k0(), Kd() (+15 more)

### Community 64 - "Frontend Runtime Module Bundle (C64)"
Cohesion: 0.22
Nodes (23): _1(), a1(), Am(), Au(), c1(), dm(), Ex(), gc() (+15 more)

### Community 65 - "Frontend Runtime Module Bundle (C65)"
Cohesion: 0.09
Nodes (21): aL(), Bo(), dI(), dT(), Eq(), JL(), L_(), Lf() (+13 more)

### Community 66 - "Frontend Runtime Module Bundle (C66)"
Cohesion: 0.10
Nodes (20): aL(), Bo(), d6(), dT(), Eq(), JL(), L_(), Lf() (+12 more)

### Community 67 - "Frontend Runtime Module Bundle (C67)"
Cohesion: 0.19
Nodes (21): ar(), bi(), dv(), fc(), fv(), G5(), Gl(), h1() (+13 more)

### Community 68 - "TypeScript Compiler Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 69 - "Frontend Runtime Module Bundle (C69)"
Cohesion: 0.15
Nodes (3): gL, I0(), pL

### Community 70 - "Frontend Runtime Module Bundle (C70)"
Cohesion: 0.15
Nodes (3): gL, I0(), pL

### Community 71 - "Frontend Runtime Module Bundle (C71)"
Cohesion: 0.18
Nodes (19): cS(), Dh(), GM(), Hl(), i1(), ic(), ju(), jx() (+11 more)

### Community 73 - "TypeScript Compiler Configuration"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 74 - "Frontend Runtime Module Bundle (C74)"
Cohesion: 0.13
Nodes (17): CY(), eC(), f(), h(), gp(), Iy(), j7(), kI() (+9 more)

### Community 76 - "Frontend Runtime Module Bundle (C76)"
Cohesion: 0.22
Nodes (13): Q(), V3(), A(), ae(), Be(), ce(), D(), de() (+5 more)

### Community 77 - "Frontend Runtime Module Bundle (C77)"
Cohesion: 0.13
Nodes (16): bA(), BL(), clamp(), formatHsl(), gA(), IL(), nl(), PL() (+8 more)

### Community 78 - "Frontend Runtime Module Bundle (C78)"
Cohesion: 0.16
Nodes (16): a4(), c4(), Ga(), gb(), Kb(), lb(), n1(), n5() (+8 more)

### Community 79 - "Frontend Runtime Module Bundle (C79)"
Cohesion: 0.22
Nodes (13): Q(), V4(), A(), ae(), Be(), ce(), D(), de() (+5 more)

### Community 80 - "UI Component: datasetMapper"
Cohesion: 0.19
Nodes (11): DatasetUploadModalProps, Step, autoDetectFieldMapping(), cleanNumeric(), FieldMapping, mapRowToProduct(), parseCsv(), SYNONYMS (+3 more)

### Community 81 - "Frontend Runtime Module Bundle (C81)"
Cohesion: 0.14
Nodes (14): AO(), bV(), dV(), gM(), gV(), hV(), mV(), PV() (+6 more)

### Community 82 - "Frontend Runtime Module Bundle (C82)"
Cohesion: 0.14
Nodes (14): AO(), bV(), dV(), gM(), gV(), hV(), mV(), PV() (+6 more)

### Community 84 - "Backend Service: VelocityReorderStrategy"
Cohesion: 0.21
Nodes (4): ReorderSuggestion, MinMaxReorderStrategy, ReorderStrategy, VelocityReorderStrategy

### Community 90 - "Backend Service: AverageCostPricingStrategy"
Cohesion: 0.18
Nodes (3): AverageCostPricingStrategy, FifoPricingStrategy, PricingStrategy

### Community 91 - "System Architecture Subsystem 91"
Cohesion: 0.18
Nodes (10): name, include-message, static-locations, server, error, port, spring, application (+2 more)

### Community 92 - "Frontend Runtime Module Bundle (C92)"
Cohesion: 0.44
Nodes (11): q3(), Z3(), a(), de(), ee(), k(), ne(), o() (+3 more)

### Community 93 - "Frontend Runtime Module Bundle (C93)"
Cohesion: 0.20
Nodes (11): clamp(), formatHsl(), IL(), nl(), PL(), QI(), Rf(), RL() (+3 more)

### Community 94 - "Frontend Runtime Module Bundle (C94)"
Cohesion: 0.44
Nodes (11): q4(), Z4(), a(), de(), ee(), k(), ne(), o() (+3 more)

### Community 95 - "Frontend Runtime Module Bundle (C95)"
Cohesion: 0.22
Nodes (10): ch(), gX(), IO(), JD(), kH(), nz(), oy(), p0() (+2 more)

### Community 97 - "Frontend Runtime Module Bundle (C97)"
Cohesion: 0.20
Nodes (4): dR(), hR(), zj, zr()

### Community 98 - "Frontend Runtime Module Bundle (C98)"
Cohesion: 0.24
Nodes (10): eC(), f(), h(), GN, Iy(), j7(), Ly(), mI() (+2 more)

### Community 100 - "Frontend Runtime Module Bundle (C100)"
Cohesion: 0.20
Nodes (4): dR(), hR(), zj, zr()

### Community 102 - "Backend Service: Category"
Cohesion: 0.22
Nodes (6): Category, BULK, ELECTRONICS, FRAGILE, GENERAL, PERISHABLE

### Community 103 - "Neuform GatewayFlow Batch Effects"
Cohesion: 0.25
Nodes (9): buildFocusedDocument(), clamp(), createEffectComponent(), DiagnosticsPanel(), NeuformBatchEffect(), readAutomaticMode(), resolveBackground(), resolveMode() (+1 more)

### Community 104 - "Frontend Runtime Module Bundle (C104)"
Cohesion: 0.25
Nodes (9): cG(), fG(), hG(), IX(), lG(), lM(), mO(), oG() (+1 more)

### Community 105 - "Frontend Runtime Module Bundle (C105)"
Cohesion: 0.36
Nodes (7): W6(), b(), c(), h(), p(), w(), y()

### Community 106 - "Backend Service: MovementType"
Cohesion: 0.25
Nodes (5): MovementType, ADJUSTMENT, IN, OUT, TRANSFER

### Community 108 - "Backend Service: Alert"
Cohesion: 0.29
Nodes (5): Severity, CRITICAL, HIGH, LOW, MEDIUM

### Community 112 - "System Architecture Subsystem 112"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 113 - "Frontend Build & Package Config"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, typecheck

### Community 114 - "UI Component: LandingPage"
Cohesion: 0.47
Nodes (5): InteractiveShelf3D(), LandingPage(), LandingPageProps, ResponsiveVideo(), ResponsiveVideoProps

### Community 115 - "Frontend Runtime Module Bundle (C115)"
Cohesion: 0.33
Nodes (6): B0(), eB(), Oj(), qz(), vp(), Yz()

### Community 116 - "Frontend Runtime Module Bundle (C116)"
Cohesion: 0.33
Nodes (6): B0(), eB(), Oj(), qz(), vp(), Yz()

### Community 117 - "System Architecture Subsystem 117"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 118 - "Backend Service: SyncStatus"
Cohesion: 0.40
Nodes (4): SyncStatus, APPLIED, CONFLICT, DUPLICATE

### Community 119 - "Neuform GatewayFlow Batch Effects"
Cohesion: 0.40
Nodes (3): ConstellationField, GatewayFlow, NeuformBatchEffectProps

### Community 120 - "System Architecture Subsystem 120"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 122 - "Frontend Build & Package Config"
Cohesion: 0.40
Nodes (4): name, private, scripts, build

### Community 124 - "UI Component: vite-env.d"
Cohesion: 0.50
Nodes (3): @designcodeio/threeui, @designcodeio/threeui/style.css, three128

### Community 128 - "Frontend Runtime Module Bundle (C128)"
Cohesion: 0.67
Nodes (3): TA(), xT(), o()

### Community 129 - "Frontend Runtime Module Bundle (C129)"
Cohesion: 0.67
Nodes (3): TA(), xT(), o()

## Knowledge Gaps
- **38 isolated node(s):** `com.iwms:iwms-core`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (+33 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1049 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `W3()` connect `Frontend Runtime Module Bundle (C5)` to `Frontend Runtime Module Bundle (C64)`, `ThreeJS Matrix & Vector Math (C1)`, `Frontend Runtime Module Bundle (C66)`, `Frontend Runtime Module Bundle (C67)`, `Frontend Runtime Module Bundle (C32)`, `Frontend Runtime Module Bundle (C37)`, `Frontend Runtime Module Bundle (C38)`, `Frontend Runtime Module Bundle (C12)`, `Frontend Runtime Module Bundle (C109)`, `Frontend Runtime Module Bundle (C78)`, `Frontend Runtime Module Bundle (C18)`, `Frontend Runtime Module Bundle (C55)`, `Frontend Runtime Module Bundle (C54)`, `Frontend Runtime Module Bundle (C22)`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `W3()` (e.g. with `_3()` and `a3()`) actually correct?**
  _`W3()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **What connects `com.iwms:iwms-core`, `LOW`, `MEDIUM` to the rest of the system?**
  _38 weakly-connected nodes found - possible missing edges._
- **Should `ThreeJS Matrix & Vector Math (C0)` be split into smaller, more focused modules?**
  _Cohesion score 0.00722895674560551 - nodes in this community are weakly interconnected._
- **Why does `W4()` connect `Frontend Runtime Module Bundle (C6)` to `ThreeJS Matrix & Vector Math (C0)`, `Frontend Runtime Module Bundle (C65)`, `Frontend Runtime Module Bundle (C34)`, `Frontend Runtime Module Bundle (C71)`, `Frontend Runtime Module Bundle (C41)`, `Frontend Runtime Module Bundle (C42)`, `Frontend Runtime Module Bundle (C111)`, `Frontend Runtime Module Bundle (C17)`, `Frontend Runtime Module Bundle (C50)`, `Frontend Runtime Module Bundle (C23)`, `Frontend Runtime Module Bundle (C56)`, `Frontend Runtime Module Bundle (C57)`, `Frontend Runtime Module Bundle (C58)`, `Frontend Runtime Module Bundle (C28)`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `W4()` (e.g. with `_4()` and `a4()`) actually correct?**
  _`W4()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Should `ThreeJS Matrix & Vector Math (C1)` be split into smaller, more focused modules?**
  _Cohesion score 0.00735784713470235 - nodes in this community are weakly interconnected._